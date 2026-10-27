/**
 * 유튜브 민담영상 챌린지 자동 현황판 (Google 시트 + Apps Script)
 *
 * - 수강생은 이름 / 채널명 / 채널 링크만 한 번 등록합니다.
 * - 스크립트가 채널의 업로드 영상을 읽어 날짜별 업로드 여부와 조회수를 자동 집계합니다.
 * - 순위는 "하루도 빠지지 않은 사람" 중에서 이달 업로드 영상 조회수 합계로만 매깁니다.
 *
 * 필요한 서비스: Apps Script 편집기 > 서비스(+) > YouTube Data API v3 (식별자: YouTube)
 */

const SHEET = {
  SETTINGS: '설정',
  PARTICIPANTS: '참가자',
  BOARD: '현황판',
  VIDEOS: '영상목록',
};
const TZ = 'Asia/Seoul';
const BOARD_HEADER_ROW = 4;
const BOARD_FIXED_COLS = ['순위', '이름', '채널명', '상태', '업로드 일수', '누락 일수', '영상 수', '총 조회수', '상금'];
const PARTICIPANT_HEADERS = ['이름', '채널명', '채널 링크', '채널ID (자동)', '확인된 채널명 (자동)', '상태 (자동)'];
const VIDEO_HEADERS = ['이름', '채널명', '업로드일', '일차', '제목', '링크', '조회수'];
const FORM_ITEMS = { name: '이름', channelName: '채널명', link: '유튜브 채널 링크' };
const COLORS = {
  done: '#b7e1cd',
  missed: '#f4c7c3',
  today: '#fce8b2',
  header: '#3c4043',
  headerText: '#ffffff',
  todayHeader: '#f9ab00',
  medals: ['#fff2cc', '#eeeeee', '#fce5cd'],
};

// ───────────────────────── 메뉴 ─────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏆 챌린지')
    .addItem('지금 조회수 갱신', 'refreshAll')
    .addSeparator()
    .addItem('① 처음 설정하기 (시트 만들기)', 'setup')
    .addItem('② 참가 신청 구글폼 만들기', 'createSignupForm')
    .addItem('③ 자동 갱신 켜기', 'installTriggers')
    .addItem('자동 갱신 끄기', 'removeTriggers')
    .addSeparator()
    .addItem('이번 달 결과 보관하기', 'archiveResults')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();

  const settings = getOrCreateSheet_(SHEET.SETTINGS);
  if (settings.getLastRow() === 0) {
    settings.getRange('B2').setNumberFormat('@');
    settings.getRange(1, 1, 7, 3).setValues([
      ['항목', '값', '설명'],
      ['챌린지 월', '', '예: 2026-11 (비워두면 이번 달)'],
      ['시작일', 1, '매월 시작일'],
      ['종료일', 30, '매월 종료일 (달의 마지막 날보다 크면 마지막 날로 자동 조정)'],
      ['자동 갱신 간격(시간)', 4, '1, 2, 4, 6, 8, 12 중 하나'],
      ['등수별 상금', '300000, 200000, 100000', '쉼표로 구분 (1등, 2등, 3등 …)'],
      ['순위표 공개 메모', '', '현황판 상단에 표시할 안내 문구 (선택)'],
    ]);
    styleHeader_(settings.getRange(1, 1, 1, 3));
    settings.setColumnWidths(1, 1, 160).setColumnWidths(2, 1, 220).setColumnWidths(3, 1, 380);
  }

  const participants = getOrCreateSheet_(SHEET.PARTICIPANTS);
  if (participants.getLastRow() === 0) {
    participants.getRange(1, 1, 1, PARTICIPANT_HEADERS.length).setValues([PARTICIPANT_HEADERS]);
    styleHeader_(participants.getRange(1, 1, 1, PARTICIPANT_HEADERS.length));
    participants.setFrozenRows(1);
    participants.setColumnWidths(1, 2, 120).setColumnWidths(3, 1, 320).setColumnWidths(4, 3, 200);
    participants.getRange(1, 4, participants.getMaxRows(), 3).setBackground('#f3f3f3');
    participants.getRange('D1').setBackground(COLORS.header);
    participants.getRange('E1:F1').setBackground(COLORS.header);
  }

  const videos = getOrCreateSheet_(SHEET.VIDEOS);
  if (videos.getLastRow() === 0) {
    videos.getRange(1, 1, 1, VIDEO_HEADERS.length).setValues([VIDEO_HEADERS]);
    styleHeader_(videos.getRange(1, 1, 1, VIDEO_HEADERS.length));
    videos.setFrozenRows(1);
  }

  getOrCreateSheet_(SHEET.BOARD);
  ss.setActiveSheet(ss.getSheetByName(SHEET.BOARD));
  ss.moveActiveSheet(1);
  toast_('시트 준비 완료! ② 참가 신청 구글폼 만들기 → ③ 자동 갱신 켜기 순서로 진행하세요.');
}

// ───────────────────────── 참가 신청 폼 ─────────────────────────

function createSignupForm() {
  const ss = SpreadsheetApp.getActive();
  const props = PropertiesService.getDocumentProperties();
  const existingId = props.getProperty('FORM_ID');
  if (existingId) {
    try {
      const existing = FormApp.openById(existingId);
      showLink_('이미 만들어진 참가 신청 폼이 있습니다', existing.getPublishedUrl());
      return;
    } catch (e) {
      // 폼이 삭제됐으면 새로 만든다
    }
  }

  const form = FormApp.create('유튜브 민담영상 챌린지 참가 신청');
  form.setDescription('이름, 채널명, 유튜브 채널 링크를 입력해 주세요. 한 번만 신청하면 매일 업로드와 조회수가 자동으로 집계됩니다.');
  form.addTextItem().setTitle(FORM_ITEMS.name).setRequired(true);
  form.addTextItem().setTitle(FORM_ITEMS.channelName).setRequired(true);
  form.addTextItem()
    .setTitle(FORM_ITEMS.link)
    .setHelpText('예: https://www.youtube.com/@내채널  (유튜브 앱 > 내 채널 > 공유 > 링크 복사)')
    .setRequired(true);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  try {
    if (typeof form.setPublished === 'function') form.setPublished(true);
  } catch (e) {
    // 게시 설정을 지원하지 않는 환경이면 무시
  }

  props.setProperty('FORM_ID', form.getId());
  props.setProperty('FORM_SYNCED_AT', '0');
  showLink_('참가 신청 폼을 만들었습니다. 이 링크를 수강생에게 보내주세요', form.getPublishedUrl());
}

/** 폼에 새로 들어온 신청을 참가자 시트에 추가한다. 같은 채널 링크는 한 번만 들어간다. */
function syncFormResponses_() {
  const props = PropertiesService.getDocumentProperties();
  const formId = props.getProperty('FORM_ID');
  if (!formId) return 0;

  let form;
  try {
    form = FormApp.openById(formId);
  } catch (e) {
    return 0;
  }

  const since = Number(props.getProperty('FORM_SYNCED_AT') || 0);
  const responses = form.getResponses(new Date(since + 1));
  if (responses.length === 0) return 0;

  const sheet = getOrCreateSheet_(SHEET.PARTICIPANTS);
  const known = new Set(readParticipants_().map((p) => normalizeLink_(p.link)));
  const rows = [];
  let latest = since;

  responses.forEach((response) => {
    latest = Math.max(latest, response.getTimestamp().getTime());
    const answers = {};
    response.getItemResponses().forEach((ir) => {
      answers[ir.getItem().getTitle()] = String(ir.getResponse() || '').trim();
    });
    const link = answers[FORM_ITEMS.link];
    if (!link || known.has(normalizeLink_(link))) return;
    known.add(normalizeLink_(link));
    rows.push([safe_(answers[FORM_ITEMS.name]), safe_(answers[FORM_ITEMS.channelName]), safe_(link), '', '', '']);
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  props.setProperty('FORM_SYNCED_AT', String(latest));
  return rows.length;
}

// ───────────────────────── 자동 갱신 ─────────────────────────

function installTriggers() {
  removeTriggers();
  const cfg = readSettings_();
  const allowed = [1, 2, 4, 6, 8, 12];
  const hours = allowed.reduce((best, h) => (Math.abs(h - cfg.intervalHours) < Math.abs(best - cfg.intervalHours) ? h : best), 4);
  ScriptApp.newTrigger('refreshAll').timeBased().everyHours(hours).create();

  const formId = PropertiesService.getDocumentProperties().getProperty('FORM_ID');
  if (formId) {
    try {
      ScriptApp.newTrigger('handleSignup').forForm(formId).onFormSubmit().create();
    } catch (e) {
      // 폼이 없어졌으면 정기 갱신만 사용
    }
  }
  toast_(`자동 갱신을 켰습니다. ${hours}시간마다 조회수를 갱신합니다.`);
  refreshAll();
}

function removeTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((t) => ['refreshAll', 'handleSignup'].indexOf(t.getHandlerFunction()) !== -1)
    .forEach((t) => ScriptApp.deleteTrigger(t));
}

/** 참가 신청이 들어오면 바로 현황판에 반영한다. */
function handleSignup() {
  refreshAll();
}

// ───────────────────────── 메인 집계 ─────────────────────────

function refreshAll() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(60 * 1000)) return;
  try {
    syncFormResponses_();
    const cfg = readSettings_();
    const period = getPeriod_(cfg, new Date());
    const participants = readParticipants_();
    resolveChannels_(participants);

    const results = participants.map((p) => {
      if (!p.channelId) return { participant: p, videos: [], error: p.status || '채널 확인 필요' };
      try {
        return { participant: p, videos: fetchVideos_(p.channelId, period), error: '' };
      } catch (e) {
        return { participant: p, videos: [], error: '영상 조회 실패: ' + e.message };
      }
    });

    writeVideos_(results);
    writeBoard_(results, period, cfg);
    toast_(`갱신 완료 (${participants.length}명)`);
  } finally {
    lock.releaseLock();
  }
}

/** 채널ID가 비어 있는 참가자의 링크를 채널ID로 바꿔 참가자 시트에 적어둔다. */
function resolveChannels_(participants) {
  const sheet = getOrCreateSheet_(SHEET.PARTICIPANTS);
  participants.forEach((p) => {
    if (p.channelId) return;
    let found;
    try {
      found = resolveChannel_(p.link);
    } catch (e) {
      found = null;
    }
    if (found) {
      p.channelId = found.id;
      p.status = found.viaSearch ? '검색으로 찾음 - 맞는 채널인지 확인' : '확인됨';
      sheet.getRange(p.row, 4, 1, 3).setValues([[found.id, safe_(found.title), p.status]]);
    } else {
      p.status = '채널을 찾을 수 없음 - 링크 확인';
      sheet.getRange(p.row, 6).setValue(p.status);
    }
  });
}

function resolveChannel_(link) {
  const parsed = parseChannelInput_(link);
  if (!parsed) return null;

  const byChannel = (params) => {
    const res = YouTube.Channels.list('snippet', params);
    const ch = res.items && res.items[0];
    return ch ? { id: ch.id, title: ch.snippet.title } : null;
  };

  switch (parsed.type) {
    case 'id':
      return byChannel({ id: parsed.value });
    case 'handle':
      return byChannel({ forHandle: parsed.value });
    case 'user':
      return byChannel({ forUsername: parsed.value });
    case 'video': {
      const res = YouTube.Videos.list('snippet', { id: parsed.value });
      const v = res.items && res.items[0];
      return v ? byChannel({ id: v.snippet.channelId }) : null;
    }
    default: {
      const res = YouTube.Search.list('snippet', { q: parsed.value, type: 'channel', maxResults: 1 });
      const s = res.items && res.items[0];
      return s ? { id: s.snippet.channelId, title: s.snippet.channelTitle, viaSearch: true } : null;
    }
  }
}

/** 수강생이 적어낸 링크(여러 형태)를 해석한다. */
function parseChannelInput_(raw) {
  let s = String(raw || '').trim();
  if (!s) return null;
  try {
    s = decodeURIComponent(s);
  } catch (e) {
    // 인코딩이 깨진 링크는 그대로 사용
  }
  let m;
  if ((m = s.match(/\b(UC[\w-]{22})\b/))) return { type: 'id', value: m[1] };
  if ((m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/live\/)([\w-]{11})/))) return { type: 'video', value: m[1] };
  if ((m = s.match(/(@[^\/?#\s]+)/))) return { type: 'handle', value: m[1] };
  if ((m = s.match(/youtube\.com\/user\/([^\/?#\s]+)/i))) return { type: 'user', value: m[1] };
  if ((m = s.match(/youtube\.com\/(?:c\/)?([^\/?#\s]+)/i))) return { type: 'search', value: m[1] };
  return { type: 'search', value: s };
}

/** 채널의 업로드 영상 중 챌린지 기간에 올라온 공개 영상과 조회수를 가져온다. */
function fetchVideos_(channelId, period) {
  const uploadsId = 'UU' + channelId.slice(2);
  const inPeriod = [];
  let pageToken;
  for (let page = 0; page < 20; page++) {
    let res;
    try {
      res = YouTube.PlaylistItems.list('contentDetails', { playlistId: uploadsId, maxResults: 50, pageToken: pageToken });
    } catch (e) {
      if (/not ?found/i.test(e.message)) return []; // 영상이 하나도 없는 채널
      throw e;
    }
    let anyRecent = false;
    (res.items || []).forEach((item) => {
      const published = item.contentDetails.videoPublishedAt;
      if (!published) return; // 비공개/삭제 영상
      const t = new Date(published);
      if (t >= period.start) anyRecent = true;
      if (t >= period.start && t <= period.end && inPeriod.indexOf(item.contentDetails.videoId) === -1) {
        inPeriod.push(item.contentDetails.videoId);
      }
    });
    pageToken = res.nextPageToken;
    if (!pageToken || !anyRecent) break;
  }

  const videos = [];
  for (let i = 0; i < inPeriod.length; i += 50) {
    const res = YouTube.Videos.list('snippet,statistics', { id: inPeriod.slice(i, i + 50).join(',') });
    (res.items || []).forEach((v) => {
      const date = Utilities.formatDate(new Date(v.snippet.publishedAt), TZ, 'yyyy-MM-dd');
      videos.push({
        id: v.id,
        title: v.snippet.title,
        date: date,
        day: Number(date.slice(8, 10)),
        views: Number((v.statistics && v.statistics.viewCount) || 0),
      });
    });
  }
  return videos.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ───────────────────────── 계산 ─────────────────────────

function getPeriod_(cfg, now) {
  const ym = cfg.month || Utilities.formatDate(now, TZ, 'yyyy-MM');
  const parts = ym.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDay = Math.max(1, Math.min(cfg.startDay, daysInMonth));
  const endDay = Math.max(startDay, Math.min(cfg.endDay, daysInMonth));
  const ymStr = `${year}-${pad2_(month)}`;
  return {
    year: year,
    month: month,
    ym: ymStr,
    startDay: startDay,
    endDay: endDay,
    startStr: `${ymStr}-${pad2_(startDay)}`,
    endStr: `${ymStr}-${pad2_(endDay)}`,
    start: new Date(`${ymStr}-${pad2_(startDay)}T00:00:00+09:00`),
    end: new Date(`${ymStr}-${pad2_(endDay)}T23:59:59.999+09:00`),
    today: Utilities.formatDate(now, TZ, 'yyyy-MM-dd'),
  };
}

/**
 * 참가자 한 명의 날짜별 상태와 합계를 계산한다.
 * 날짜 상태: done(업로드) / missed(지난 날인데 업로드 없음) / today(오늘, 아직 없음) / future
 */
function summarize_(result, period) {
  const uploadedDays = new Set(result.videos.map((v) => v.day));
  const cells = [];
  for (let d = period.startDay; d <= period.endDay; d++) {
    const dateStr = `${period.ym}-${pad2_(d)}`;
    if (uploadedDays.has(d)) cells.push('done');
    else if (dateStr < period.today) cells.push('missed');
    else if (dateStr === period.today) cells.push('today');
    else cells.push('future');
  }
  const missed = cells.filter((c) => c === 'missed').length;
  const uploaded = cells.filter((c) => c === 'done').length;
  const ended = period.today > period.endStr;
  const totalViews = result.videos.reduce((sum, v) => sum + v.views, 0);
  const eligible = !result.error && missed === 0;

  let status;
  if (result.error) status = '⚠ ' + result.error;
  else if (missed > 0) status = `탈락 (${missed}일 누락)`;
  else if (ended) status = '🏆 개근 달성';
  else status = '🔥 개근 도전 중';

  return { result: result, cells: cells, missed: missed, uploaded: uploaded, totalViews: totalViews, eligible: eligible, status: status };
}

/** 개근자(누락 0일)만 조회수로 순위를 매긴다. 같은 조회수는 같은 순위. */
function rank_(summaries) {
  const sorted = summaries.slice().sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
    return String(a.result.participant.name).localeCompare(String(b.result.participant.name), 'ko');
  });
  let prevViews = null;
  let prevRank = 0;
  sorted.forEach((s, i) => {
    if (!s.eligible) {
      s.rank = null;
      return;
    }
    s.rank = s.totalViews === prevViews ? prevRank : i + 1;
    prevViews = s.totalViews;
    prevRank = s.rank;
  });
  return sorted;
}

// ───────────────────────── 시트 쓰기 ─────────────────────────

function writeBoard_(results, period, cfg) {
  const sheet = getOrCreateSheet_(SHEET.BOARD);
  sheet.clear();
  sheet.setFrozenRows(0);
  sheet.setFrozenColumns(0);

  const ranked = rank_(results.map((r) => summarize_(r, period)));
  const dayCount = period.endDay - period.startDay + 1;
  const totalCols = BOARD_FIXED_COLS.length + dayCount;
  const ended = period.today > period.endStr;
  const todayIndex = period.today.slice(0, 7) === period.ym ? Number(period.today.slice(8)) - period.startDay : -1;
  const eligibleCount = ranked.filter((s) => s.eligible).length;

  if (sheet.getMaxColumns() < totalCols) sheet.insertColumnsAfter(sheet.getMaxColumns(), totalCols - sheet.getMaxColumns());

  // 제목 + 요약
  const dayNo = todayIndex >= 0 && todayIndex < dayCount ? `${todayIndex + 1}일차` : ended ? '종료' : '시작 전';
  sheet.getRange(1, 1).setValue(`🏆 ${period.year}년 ${period.month}월 유튜브 민담영상 챌린지`).setFontSize(16).setFontWeight('bold');
  sheet.getRange(2, 1).setValue(
    `기간 ${period.month}/${period.startDay} ~ ${period.month}/${period.endDay} · 오늘 ${dayNo} · 참가 ${ranked.length}명 · ` +
      `${ended ? '개근 달성' : '개근 유지'} ${eligibleCount}명 · 마지막 갱신 ${Utilities.formatDate(new Date(), TZ, 'M/d HH:mm')}`
  );
  sheet.getRange(3, 1).setValue(
    cfg.note || '순위는 하루도 빠짐없이 업로드한 사람 중 이달 업로드 영상 조회수 합계로만 매깁니다.  ● 업로드  ✕ 누락  ○ 오늘 아직'
  ).setFontColor('#5f6368');

  // 헤더
  const header = BOARD_FIXED_COLS.slice();
  for (let d = period.startDay; d <= period.endDay; d++) header.push(String(d));
  const headerRange = sheet.getRange(BOARD_HEADER_ROW, 1, 1, totalCols);
  headerRange.setValues([header]);
  styleHeader_(headerRange);
  if (todayIndex >= 0 && todayIndex < dayCount) {
    sheet.getRange(BOARD_HEADER_ROW, BOARD_FIXED_COLS.length + 1 + todayIndex).setBackground(COLORS.todayHeader);
  }

  if (ranked.length === 0) {
    sheet.getRange(BOARD_HEADER_ROW + 1, 1).setValue('아직 참가자가 없습니다. 참가자 시트에 수강생을 등록하거나 참가 신청 폼 링크를 공유하세요.');
    return;
  }

  // 본문
  const prizes = cfg.prizes;
  const symbol = { done: '●', missed: '✕', today: '○', future: '' };
  const values = [];
  const backgrounds = [];
  ranked.forEach((s) => {
    const p = s.result.participant;
    const prize = s.rank && s.rank <= prizes.length ? prizes[s.rank - 1] : '';
    values.push(
      [s.rank || '-', safe_(p.name), safe_(p.channelName), s.status, s.uploaded, s.missed, s.result.videos.length, s.totalViews, prize].concat(
        s.cells.map((c) => symbol[c])
      )
    );
    const medal = s.rank && s.rank <= 3 ? COLORS.medals[s.rank - 1] : null;
    backgrounds.push(
      BOARD_FIXED_COLS.map(() => medal).concat(s.cells.map((c) => (c === 'future' ? null : COLORS[c])))
    );
  });

  const body = sheet.getRange(BOARD_HEADER_ROW + 1, 1, values.length, totalCols);
  body.setValues(values).setBackgrounds(backgrounds).setVerticalAlignment('middle');
  sheet.getRange(BOARD_HEADER_ROW + 1, 1, values.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
  sheet.getRange(BOARD_HEADER_ROW + 1, 5, values.length, 3).setHorizontalAlignment('center');
  sheet.getRange(BOARD_HEADER_ROW + 1, 8, values.length, 1).setNumberFormat('#,##0').setFontWeight('bold');
  sheet.getRange(BOARD_HEADER_ROW + 1, 9, values.length, 1).setNumberFormat('#,##0"원"');
  sheet.getRange(BOARD_HEADER_ROW + 1, BOARD_FIXED_COLS.length + 1, values.length, dayCount).setHorizontalAlignment('center');
  ranked.forEach((s, i) => {
    if (!s.eligible) sheet.getRange(BOARD_HEADER_ROW + 1 + i, 1, 1, BOARD_FIXED_COLS.length).setFontColor('#9aa0a6');
  });

  sheet.setFrozenRows(BOARD_HEADER_ROW);
  sheet.setFrozenColumns(3);
  sheet.setColumnWidth(1, 50).setColumnWidths(2, 2, 120).setColumnWidth(4, 170).setColumnWidths(5, 3, 75).setColumnWidths(8, 2, 100);
  sheet.setColumnWidths(BOARD_FIXED_COLS.length + 1, dayCount, 30);
}

function writeVideos_(results) {
  const sheet = getOrCreateSheet_(SHEET.VIDEOS);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, VIDEO_HEADERS.length).setValues([VIDEO_HEADERS]);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, VIDEO_HEADERS.length).clearContent();

  const rows = [];
  results.forEach((r) => {
    r.videos.forEach((v) => {
      rows.push([
        safe_(r.participant.name),
        safe_(r.participant.channelName),
        v.date,
        v.day,
        safe_(v.title),
        'https://youtu.be/' + v.id,
        v.views,
      ]);
    });
  });
  if (rows.length) {
    sheet.getRange(2, 3, rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 1, rows.length, VIDEO_HEADERS.length).setValues(rows);
    sheet.getRange(2, 7, rows.length, 1).setNumberFormat('#,##0');
  }
}

function archiveResults() {
  const ss = SpreadsheetApp.getActive();
  const board = ss.getSheetByName(SHEET.BOARD);
  if (!board) return;
  const period = getPeriod_(readSettings_(), new Date());
  const name = `결과_${period.ym}`;
  const old = ss.getSheetByName(name);
  if (old) ss.deleteSheet(old);
  board.copyTo(ss).setName(name);
  toast_(`'${name}' 시트로 보관했습니다.`);
}

// ───────────────────────── 읽기 ─────────────────────────

function readSettings_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET.SETTINGS);
  const map = {};
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().forEach((row) => {
      map[String(row[0]).trim()] = row[1];
    });
  }

  let month = map['챌린지 월'];
  if (month instanceof Date) month = Utilities.formatDate(month, TZ, 'yyyy-MM');
  month = String(month || '').trim();
  if (month) {
    const m = month.match(/^(\d{4})[-./](\d{1,2})/);
    if (!m) throw new Error(`설정 시트의 '챌린지 월' 값(${month})을 2026-11 형식으로 적어주세요.`);
    month = `${m[1]}-${pad2_(Number(m[2]))}`;
  }

  const prizes = String(map['등수별 상금'] || '')
    .split(',')
    .map((s) => Number(s.replace(/[^\d]/g, '')))
    .filter((n) => n > 0);

  return {
    month: month,
    startDay: Number(map['시작일']) || 1,
    endDay: Number(map['종료일']) || 30,
    intervalHours: Number(map['자동 갱신 간격(시간)']) || 4,
    prizes: prizes,
    note: String(map['순위표 공개 메모'] || '').trim(),
  };
}

function readParticipants_() {
  const sheet = getOrCreateSheet_(SHEET.PARTICIPANTS);
  if (sheet.getLastRow() < 2) return [];
  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, PARTICIPANT_HEADERS.length)
    .getValues()
    .map((row, i) => ({
      row: i + 2,
      name: String(row[0]).trim(),
      channelName: String(row[1]).trim(),
      link: String(row[2]).trim(),
      channelId: String(row[3]).trim(),
      status: String(row[5]).trim(),
    }))
    .filter((p) => p.link);
}

// ───────────────────────── 도우미 ─────────────────────────

function getOrCreateSheet_(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function styleHeader_(range) {
  range.setBackground(COLORS.header).setFontColor(COLORS.headerText).setFontWeight('bold').setHorizontalAlignment('center');
}

function normalizeLink_(link) {
  return String(link || '').trim().toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/, '').replace(/\/+$/, '');
}

/** 수강생 입력이나 영상 제목이 수식(=, +, -, @)으로 해석되지 않게 막는다. */
function safe_(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

function toast_(message) {
  try {
    SpreadsheetApp.getActive().toast(message, '챌린지', 8);
  } catch (e) {
    // 자동 실행 중에는 알림을 띄울 화면이 없다
  }
}

function showLink_(title, url) {
  const html = HtmlService.createHtmlOutput(
    `<p style="font-family:sans-serif">${title}</p>` +
      `<p style="font-family:sans-serif"><a href="${url}" target="_blank">${url}</a></p>`
  ).setWidth(520).setHeight(160);
  SpreadsheetApp.getUi().showModalDialog(html, '참가 신청 폼');
}
