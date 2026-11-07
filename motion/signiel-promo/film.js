/* ============================================================
   시그니엘 서울 STAY 홍보 모션 — 레퍼런스(앱 런칭 필름)의 문법, STAY 실내의 노란 의자 빛깔.
   '미슐랭 맛집'과 '미쉐린 3스타 셰프 야닉 알레노'를 앞세우고 리뷰를 중심에: 리뷰 키워드, 리뷰 카드, 리뷰 타자.
   사진은 받은 실사 이미지(assets/), 지도는 받은 지도를 보고 다시 그린 약도.
   window.ORIENT = 'h'(16:9) | 'v'(9:16). 모든 프레임은 시간 t 만으로 결정된다.
   ============================================================ */

/* ---------- 1. 설정 (16:9 와 9:16 이 같은 타임라인을 쓴다) ---------- */
const V = window.ORIENT === 'v';                   // 세로(9:16) 버전
const W = V ? 1080 : 1920, H = V ? 1920 : 1080, FPS = 30, DUR = 55.0;
const o = (h, v) => (V ? v : h);                   // 가로 값, 세로 값
const BPM = 120, BEAT = 60 / BPM;
const T = {
  hook:    [0, 3.0],     // 미슐랭 맛집, STAY → 휴대폰 (캐비아 카놀리 사진)
  scan:    [3.0, 5.5],   // 사진 속으로 — 리뷰 키워드
  seal:    [5.5, 8.5],   // '미슐랭 맛집' 도장 쾅 + 셰프 야닉 알레노 + 창의적인 프랑스 요리
  tilt:    [8.5, 11.0],  // 한 코스, 한 코스 (볼오방 사진 + 리뷰 카드)
  sauce:   [11.0, 14.0], // 산미와 감칠맛, 소스가 킥 (새우 사진 + 맛 배지)
  menu:    [14.0, 19.5], // 런치 · 디너 · 와인 페어링 · 글루텐프리 · 비건 → 카놀리 + 리뷰
  reviews: [19.5, 28.0], // (보라) 리뷰 타자 + 리뷰 카드 두 장
  service: [28.0, 32.0], // (밤 파랑) 접객은 말할 것 없이 — 시그니엘 입구
  montage: [32.0, 37.5], // 화면 다섯 개
  store:   [37.5, 42.0], // STAY 실내 사진 + 서울 시내가 한눈에 (가게 소개글)
  map:     [42.0, 49.0], // 약도 + 주소
  end:     [49.0, DUR],  // 미슐랭 맛집 도장 + STAY + 잊지 못할 다이닝
};

const C = {
  bg: '#08080a',
  ember: '#2e2a16',   // 기본 빛: 금빛 올리브 (노란 의자 · 금빛 조명)
  night: '#132a4a',   // 접객 장면: 밤 파랑 (한강 · 창밖)
  plum: '#2b1a4a',
  acc: '#FFD84A',     // 노란 의자 빛
  acc2: '#F2B705',
  fg: '#F7F6F2',
  muted: 'rgba(247,246,242,0.6)',
  ui: '#ffffff', uiInk: '#141416', uiMuted: '#83837f', uiChip: '#f2f1ec', uiBtn: '#1c1c1e',
};

// 화면 문구 — 사용자가 준 사진·리뷰·소개글·편의시설·지도·주소·영업 정보에서만
const COPY = {
  brand: 'STAY',
  place: '시그니엘 서울',
  chef: '야닉 알레노',
  tag: 'SIGNIEL SEOUL · 81F · YANNICK ALLÉNO',
  addr1: '서울 송파구', addr2: '올림픽로 300',
  floor: '롯데월드타워 81층',
  subway: '잠실역(2·8호선) 2번 출구에서 27m',
  tel: '02-3213-1230',
  hours: '매일 06:30–21:30 · 라스트오더 20:00',
  brk: '브레이크타임 10–12시 · 14:30–18시',
  park: '주차 가능 · 발렛 35,000원',
  // 메뉴판을 받지 못해 리뷰 · 편의시설 안내에 나온 것만 (가격 없음)
  menu: [['런치', '점심 방문 · 예약 후 이용'], ['디너', '저녁 방문 · 예약 후 이용'], ['와인 페어링', '소믈리에 · 콜키지 가능(유료)'], ['글루텐프리 메뉴', '편의시설 안내'], ['비건 메뉴', '편의시설 안내']],
  intro: '미쉐린 3스타 셰프 \'야닉 알레노\'가 선사하는 잊지 못할 다이닝',
  r1: '친절함과 서비스 그리고 프렌치의 정수를 맑고 깨끗하게 느낄 수 있었으며, 이날의 랍스터 요리는 신선도, 식감과 더불어 산미와 감칠맛을 한껏 기분 좋게 끌어올려주는 소스가 하나의 킥이었다',
  r1q: '산미와 감칠맛을 한껏 기분 좋게 끌어올려주는 소스가 하나의 킥이었다',
  r2: '뷰가 참 예쁘고 좋더라구요. 서비스도 깔끔하고 좋았어요. 음식에 잘 맞는 와인이 페어링 되어있는것두 좋더라구요. 모임이나 기념일에 오기 딱 좋은 곳',
  r2w: '음식에 잘 맞는 와인이 페어링 되어있는것두 좋더라구요.',
  r3: '섬세한 플레이팅과 조화로운 풍미 한 코스 한 코스에 담긴 셰프의 정성이 느껴졌고',
  r4v: '한강을 바라볼 수 있는 뷰도 시간별로 다양하게 즐길 수 있는 것이 더욱 더 특별하게 만들어줬어요!!',
  r4a: '“특별한 날, 정말', r4b: '특별한 한 끼”',
  r5: '애기 100일잔치로 먹고왔는데 추천이여! 애기 유모차 둬야해서 공간협소하지않은곳으로 부탁드렸더니 맨끝쪽으로 안내해주심 센스짱👍👍',
  r5b: '음식도 맛있고 친절해서 또 놀러올예정 ♡♡',
};

/* ---------- 2. 수학 ---------- */
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
const eOutCubic = k => 1 - Math.pow(1 - k, 3);
const eOutExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const eInCubic = k => k * k * k;
const eInOutCubic = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eInOutQuint = k => (k < 0.5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2);
const eOutBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const inT = (t, k) => t >= T[k][0] && t < T[k][1];

const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* ---------- 3. 글자 ---------- */
function setFont(g, o) {
  g.font = `${o.weight ?? 800} ${o.size ?? 60}px ${o.fam ?? 'Pre'}`;
  g.textAlign = o.align ?? 'left';
  g.textBaseline = 'alphabetic';
  g.letterSpacing = (o.ls ?? 0) + 'px';
}
function text(s, x, y, o = {}, g = ctx) {
  g.save(); setFont(g, o);
  g.globalAlpha *= o.alpha ?? 1;
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = o.shadowBlur ?? 20; }
  g.fillStyle = o.color ?? C.fg;
  g.fillText(s, x, y);
  g.restore();
}
function measure(s, o, g = ctx) { g.save(); setFont(g, o); const w = g.measureText(s).width; g.restore(); return w; }
const HEAD = { weight: 800, size: 96, ls: -2.5 };   // 큰 제목 (레퍼런스의 굵은 그로테스크)

/* 블러에서 맺히는 제목. lines: [[[글자, 색], ...], ...]  (어절 단위로 차례로)
   k0: 등장 시작(장면 시간), out: 사라지기 시작 시각(없으면 안 사라짐) */
function blurHead(lines, x, y, lt, k0, o = {}) {
  const st = { ...HEAD, ...o };
  const lh = st.size * (o.lh ?? 1.1);
  const outK = o.out != null ? sstep(o.out, o.out + 0.35, lt) : 0;
  let idx = 0;
  lines.forEach((segs, li) => {
    const words = [];
    segs.forEach(([s, col]) => s.split(/(?<= )/).forEach(w => w && words.push([w, col])));
    const total = words.reduce((a, [w]) => a + measure(w, st), 0);
    let cx = st.align === 'center' ? x - total / 2 : st.align === 'right' ? x - total : x;
    words.forEach(([w, col]) => {
      const k = eOutCubic(prog(lt, k0 + idx * 0.07, k0 + idx * 0.07 + 0.55));
      idx++;
      const ww = measure(w, st);
      const a = k * (1 - outK);
      if (a > 0.01) {
        ctx.save();
        const b = (1 - k) * 18 + outK * 14;
        if (b > 0.4) ctx.filter = `blur(${b.toFixed(1)}px)`;
        ctx.globalAlpha = a;
        text(w, cx + (1 - k) * 18, y + li * lh, { ...st, align: 'left', color: col });
        ctx.restore();
      }
      cx += ww;
    });
  });
}
// ● MONO LABEL
function eyebrow(label, x, y, lt, k0, out, color = C.acc) {
  const k = prog(lt, k0, k0 + 0.4) * (out != null ? 1 - prog(lt, out, out + 0.3) : 1);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x + 5, y - 6, 4.5, 0, TAU); ctx.fill();
  const shown = label.slice(0, Math.ceil(label.length * clamp(prog(lt, k0, k0 + 0.5) * 1.2)));
  text(shown, x + 20, y, { fam: 'Mono', weight: 400, size: 17, ls: 5, color: 'rgba(247,243,238,0.72)' });
  ctx.restore();
}
function subline(s, x, y, lt, k0, out, o = {}) {
  const k = prog(lt, k0, k0 + 0.5) * (out != null ? 1 - prog(lt, out, out + 0.3) : 1);
  if (k <= 0) return;
  text(s, x, y, { weight: 500, size: 27, ls: -0.3, color: C.muted, alpha: eOutCubic(k), ...o });
}

/* ---------- 4. 배경: 장면마다 빛 색이 바뀌는 비네트 ---------- */
function glowColorAt(t) {
  // 리뷰 장면은 보라, 접객 장면은 밤 파랑, 나머지는 금빛 올리브
  const toPlum = sstep(T.reviews[0] - 0.4, T.reviews[0] + 0.3, t) * (1 - sstep(T.service[0] - 0.4, T.service[0] + 0.3, t));
  const toNight = sstep(T.service[0] - 0.4, T.service[0] + 0.3, t) * (1 - sstep(T.montage[0] - 0.4, T.montage[0] + 0.3, t));
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const E = p(C.ember), Pl = p(C.plum), Ni = p(C.night);
  return E.map((v, i) => Math.round(v + (Pl[i] - v) * toPlum + (Ni[i] - v) * toNight));
}
function background(t, gx = W * 0.62, gy = H * 0.42, strength = 1) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const [r, g, b] = glowColorAt(t);
  const R = 1250;
  const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, R);
  gr.addColorStop(0, `rgba(${r},${g},${b},${0.95 * strength})`);
  gr.addColorStop(0.45, `rgba(${r},${g},${b},${0.42 * strength})`);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  // 아래쪽 은은한 숯불 빛
  const g2 = ctx.createLinearGradient(0, H, 0, H * 0.55);
  g2.addColorStop(0, `rgba(${Math.min(255, r + 40)},${g},${Math.max(0, b - 10)},0.16)`); g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
}
let NOISE;
function buildNoise() {
  NOISE = mk(256, 256);
  const g = NOISE.getContext('2d'), img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = hash(i * 0.41 + 2.7) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
}
function grain(t, alpha = 0.045) {
  const f = Math.floor(t * FPS / 2);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  const ox = -Math.floor(hash(f) * 256), oy = -Math.floor(hash(f + 0.5) * 256);
  for (let y = oy; y < H; y += 256) for (let x = ox; x < W; x += 256) ctx.drawImage(NOISE, x, y);
  ctx.restore();
}
function vignette(s = 0.5) {
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.66);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${s})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

/* ---------- 5. 그리기 도구 · 연기 ---------- */
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function rad(g, x, y, r0, r1, stops, x1 = x, y1 = y) { const gr = g.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function smoke(g, x, y, w, h, t, n = 5, alpha = 0.22) {
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.25 + hash(i * 3.7)) % 1;
    const sx = x + w * (0.3 + hash(i) * 0.4), sy = y + h * (1 - ph) ;
    g.strokeStyle = `rgba(235,225,215,${alpha * Math.sin(ph * Math.PI)})`; g.lineWidth = w * 0.06 * (0.5 + ph);
    g.filter = `blur(${(w * 0.02).toFixed(1)}px)`;
    g.beginPath(); g.moveTo(sx, sy);
    for (let k = 1; k <= 6; k++) g.lineTo(sx + Math.sin(k * 0.9 + t * 1.3 + i) * w * 0.06 * k * 0.4, sy - k * h * 0.06);
    g.stroke();
  }
  g.filter = 'none'; g.restore();
}
function embers(g, x, y, w, h, t, n = 26) {
  g.save();
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.35 + hash(i) * 0.3) + hash(i * 5.1)) % 1;
    const px = x + w * (0.25 + hash(i * 2.2) * 0.5) + Math.sin(t * 2 + i) * w * 0.03, py = y + h * (1 - ph);
    g.fillStyle = `rgba(255,${140 + Math.floor(hash(i) * 80)},60,${Math.sin(ph * Math.PI) * 0.9})`;
    g.beginPath(); g.arc(px, py, (1.5 + hash(i * 3) * 2.5) * (w / 400), 0, TAU); g.fill();
  }
  g.restore();
}
function steam(g, x, y, w, h, t) { smoke(g, x, y, w, h, t * 1.4, 4, 0.18); }

/* ============================================================
   6. 휴대폰 화면 (390×844 점 좌표) — 밝은 앱 화면
   ============================================================ */
const SW = 390, SH = 844;
function statusBar(g, dark = false) {
  const c = dark ? '#fff' : '#111';
  text('9:41', 38, 34, { weight: 700, size: 16, color: c }, g);
  g.fillStyle = c;
  [0, 1, 2, 3].forEach(i => g.fillRect(292 + i * 6, 30 - i * 3, 4, 4 + i * 3));
  g.beginPath(); g.arc(328, 31, 7, Math.PI * 1.2, Math.PI * 1.8); g.lineWidth = 2.4; g.strokeStyle = c; g.stroke();
  g.beginPath(); g.arc(328, 31, 3.6, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
  rr(g, 342, 22, 24, 12, 3.5); g.lineWidth = 1.5; g.stroke(); g.fillRect(345, 25, 16, 6);
}
function island(g) { g.fillStyle = '#000'; rr(g, SW / 2 - 62, 11, 124, 36, 18); g.fill(); }
function btn(g, x, y, w, h, label, k = 1) {
  g.save(); g.globalAlpha *= k;
  rr(g, x, y, w, h, h / 2); g.fillStyle = C.uiBtn; g.fill();
  text(label, x + w / 2, y + h / 2 + 6, { weight: 700, size: 16, align: 'center', color: '#fff' }, g);
  g.restore();
}
function chip(g, x, y, label, on = false) {
  const w = measure(label, { weight: 600, size: 13 }, g) + 24;
  rr(g, x, y, w, 28, 14); g.fillStyle = on ? '#fff4c2' : C.uiChip; g.fill();
  text(label, x + 12, y + 19, { weight: 600, size: 13, color: on ? '#8a6a00' : '#6a6862' }, g);
  return w;
}
function lines(g, x, y, w, n, gap = 16, col = '#e9e4de') { g.fillStyle = col; for (let i = 0; i < n; i++) { rr(g, x, y + i * gap, w * (i === n - 1 ? 0.6 : 1 - hash(i + x) * 0.15), 7, 3.5); g.fill(); } }
function cover(g, img, x, y, w, h, zoom = 1, px, py) {
  px = px ?? img.fx ?? 0.5; py = py ?? img.fy ?? 0.5;
  const s = Math.max(w / img.width, h / img.height) * zoom, dw = img.width * s, dh = img.height * s;
  g.drawImage(img, x + (w - dw) * px, y + (h - dh) * py, dw, dh);
}

// 매장 실사 사진 — [이름, 파일, 초점 x, 초점 y]  (받은 사진이 작아 2.5~4배로 키우고 살짝 선명하게)
const CACHE = {};
const PHOTOS = [
  ['cannoli', 'assets/cannoli.jpg', 0.5, 0.45],    // 양 끝에 캐비아를 올린 카놀리, 크림, 노란 꽃
  ['shrimp', 'assets/shrimp.jpg', 0.4, 0.6],       // 윤기 나는 새우 · 소스, 벌집꿀 한 조각, 초록 크림
  ['volau', 'assets/volauvent.jpg', 0.5, 0.45],    // 바삭한 페이스트리 위 하얀 살, 크림 소스 (넓은 접시)
  ['hall', 'assets/hall.jpg', 0.45, 0.5],          // STAY 실내: 노란 의자 · 체크무늬 대리석 바닥 · 금빛 조명 · 큰 창
  ['door', 'assets/door.jpg', 0.4, 0.6],           // 시그니엘 입구: 대리석 · 금빛 유리문 · 검은 정장의 직원
  ['sign', 'assets/sign.jpg', 0.5, 0.5],           // 입구 위 SIGNIEL 글자
];
function loadImage(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
async function loadPhotos() {
  await Promise.all(PHOTOS.map(async ([k, src, fx, fy]) => { const im = await loadImage(src); if (im) { im.fx = fx; im.fy = fy; CACHE[k] = im; } }));
}
const KJ = 'Pre, NotoKR';

/* '미슐랭 맛집' 도장 — 별이나 미쉐린 로고 없이 글자만 */
function sealBadge(g, x, y, r, o2 = {}) {
  g.save(); g.translate(x, y); g.rotate(o2.rot ?? 0);
  g.fillStyle = lin(g, -r, -r, r, r, [[0, '#FFF0A8'], [0.5, '#F5C84A'], [1, '#C9962A']]);
  g.beginPath();
  const n = 40;
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r2 = i % 2 ? r : r * 0.95; g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); }
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(80,55,5,0.55)'; g.lineWidth = Math.max(1.5, r * 0.02);
  g.beginPath(); g.arc(0, 0, r * 0.86, 0, TAU); g.stroke();
  g.setLineDash([r * 0.025, r * 0.03]); g.beginPath(); g.arc(0, 0, r * 0.6, 0, TAU); g.stroke(); g.setLineDash([]);
  const ring = 'STAY · SIGNIEL SEOUL · 시그니엘 서울 · STAY · SIGNIEL SEOUL · 시그니엘 서울 · ';
  const fs = r * 0.105;
  setFont(g, { weight: 800, size: fs, align: 'center' });
  g.fillStyle = '#3f2c04';
  const chars = [...ring], ws = chars.map(c => g.measureText(c).width), total = ws.reduce((a, b) => a + b, 0);
  let acc = 0;
  chars.forEach((c, i) => {
    const th = (acc + ws[i] / 2) / total * TAU;
    g.save(); g.rotate(th); g.fillText(c, 0, -r * 0.69); g.restore();
    acc += ws[i];
  });
  text('미슐랭', 0, -r * 0.01, { weight: 800, size: r * 0.29, ls: -r * 0.008, align: 'center', color: '#33240a' }, g);
  text('맛집', 0, r * 0.33, { weight: 800, size: r * 0.31, align: 'center', color: '#33240a' }, g);
  g.restore();
}

/* ---------- 휴대폰 화면 ---------- */
function scrHero(g, t) {
  cover(g, CACHE.cannoli, 0, 0, SW, SH, 1.06 + 0.01 * t);
  g.fillStyle = lin(g, 0, 0, 0, 120, [[0, 'rgba(0,0,0,0.5)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 0, SW, 120);
  statusBar(g, true);
  const lab = 'STAY · 미슐랭 맛집', lw = measure(lab, { weight: 700, size: 13 }, g) + 30;
  rr(g, SW / 2 - lw / 2, 60, lw, 32, 16); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
  text(lab, SW / 2, 81, { weight: 700, size: 13, align: 'center', color: '#fff' }, g);
  g.fillStyle = lin(g, 0, SH - 160, 0, SH, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]); g.fillRect(0, SH - 160, SW, 160);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(SW / 2, SH - 78, 30, 0, TAU); g.stroke();
  g.fillStyle = C.acc; g.beginPath(); g.arc(SW / 2, SH - 78, 23, 0, TAU); g.fill();
}
function scrDish(g, t, img, title, sub, chips, btnLabel, o2 = {}) {
  g.fillStyle = C.ui; g.fillRect(0, 0, SW, SH);
  cover(g, img, 0, 0, SW, 430, 1.0 + (o2.zoom || 0));
  statusBar(g, true);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(34, 78, 16, 0, TAU); g.fill();
  g.strokeStyle = '#111'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(38, 71); g.lineTo(31, 78); g.lineTo(38, 85); g.stroke();
  if (o2.seal) sealBadge(g, SW - 52, 78, 34, { rot: -0.12 });
  rr(g, 0, 410, SW, SH - 410, 26); g.fillStyle = C.ui; g.fill();
  g.fillStyle = '#e2e1dc'; rr(g, SW / 2 - 20, 420, 40, 5, 2.5); g.fill();
  text(title, 26, 470, { weight: 800, size: 27, ls: -0.5, color: C.uiInk }, g);
  text(sub, 26, 498, { weight: 500, size: 14, color: C.uiMuted }, g);
  let cx = 26; chips.forEach((c, i) => { cx += chip(g, cx, 520, c, i === 0) + 8; });
  lines(g, 26, 578, SW - 52, 3, 16, '#ecebe6');
  rr(g, 26, 640, SW - 52, 86, 18); g.fillStyle = '#f7f6f0'; g.fill();
  text(o2.boxTitle || '방문 리뷰', 44, 670, { weight: 700, size: 14, color: C.uiInk }, g);
  text(o2.boxSub || '', 44, 697, { weight: 500, size: 13, color: C.uiMuted }, g);
  btn(g, 26, SH - 92, SW - 52, 54, btnLabel);
}
const MENU_IMG = { '런치': 'cannoli', '디너': 'volau', '와인 페어링': 'hall' };
function scrMenu(g, t, scroll = 0) {
  g.fillStyle = '#f6f6f3'; g.fillRect(0, 0, SW, SH);
  g.save(); g.beginPath(); g.rect(0, 168, SW, SH - 168); g.clip();
  COPY.menu.forEach(([name, sub], i) => {
    const y = 176 + i * 96 - scroll;
    if (y < 100 || y > SH) return;
    rr(g, 20, y, SW - 40, 84, 18); g.fillStyle = '#fff'; g.fill();
    g.save(); rr(g, 30, y + 10, 64, 64, 14); g.clip();
    const im = CACHE[MENU_IMG[name]];
    if (im) cover(g, im, 30, y + 10, 64, 64, 1.3);
    else { g.fillStyle = lin(g, 30, y + 10, 94, y + 74, [[0, '#e9c64a'], [1, '#4a3b0a']]); g.fillRect(30, y + 10, 64, 64); text(name[0], 62, y + 54, { weight: 800, size: 26, align: 'center', color: '#fff' }, g); }
    g.restore();
    text(name, 110, y + 38, { weight: 800, size: 18, color: C.uiInk }, g);
    text(sub, 110, y + 62, { weight: 500, size: 13, color: C.uiMuted }, g);
  });
  text('리뷰 · 편의시설 안내에 나온 것', SW / 2, 176 + 5 * 96 + 34 - scroll, { weight: 600, size: 13, align: 'center', color: '#b3aa9c' }, g);
  g.restore();
  g.fillStyle = '#f6f6f3'; g.fillRect(0, 0, SW, 168);
  statusBar(g);
  text('메뉴', 26, 102, { weight: 800, size: 30, color: C.uiInk }, g);
  rr(g, SW - 120, 82, 94, 28, 14); g.fillStyle = '#fff4c2'; g.fill();
  text('안내 그대로', SW - 73, 101, { weight: 700, size: 12, align: 'center', color: '#8a6a00' }, g);
  let cx = 26; ['전체', '런치', '디너', '와인'].forEach((c, i) => { cx += chip(g, cx, 126, c, i === 0) + 8; });
}
function scrReview(g, t, typed, kOn = 1, full = '') {
  g.fillStyle = '#f6f6f3'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  text('리뷰', 26, 100, { weight: 800, size: 30, color: C.uiInk }, g);
  text('STAY, 어떠셨나요?', 26, 126, { weight: 500, size: 14, color: C.uiMuted }, g);
  let cx = 26;
  [['😋 음식이 맛있어요', 0.0], ['🙇 친절해요', 0.4]].forEach(([c, at]) => { cx += chip(g, cx, 146, c, kOn > at) + 8; });
  rr(g, 20, 192, SW - 40, 184, 18); g.fillStyle = '#fff'; g.fill();
  const words = typed.split(' '); let line = '', y = 226; const lns = [];
  words.forEach(w => { const tr = line ? line + ' ' + w : w; if (measure(tr, { weight: 500, size: 15 }, g) > SW - 80 && line) { lns.push(line); line = w; } else line = tr; });
  if (line) lns.push(line);
  const shown = lns.slice(-6);
  shown.forEach((l, i) => text(l, 40, y + i * 24, { weight: 500, size: 15, color: C.uiInk }, g));
  if (Math.floor(t * 2.5) % 2 === 0) { const last = shown[shown.length - 1] || ''; g.fillStyle = C.uiBtn; g.fillRect(42 + measure(last, { weight: 500, size: 15 }, g), y + (Math.max(1, shown.length) - 1) * 24 - 15, 2, 19); }
  rr(g, SW - 68, 392, 48, 32, 16); g.fillStyle = C.uiBtn; g.fill();
  text('등록', SW - 44, 413, { weight: 700, size: 13, align: 'center', color: '#fff' }, g);
  g.fillStyle = '#d3d6d4'; g.fillRect(0, SH - 300, SW, 300);
  const rowsK = [['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'], ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'], ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']];
  const hit = Math.floor(t * 9) % 26;
  rowsK.forEach((row, r) => row.forEach((ch, i) => {
    const kw = 33, x = (SW - row.length * (kw + 4.5)) / 2 + i * (kw + 4.5), y2 = SH - 286 + r * 54;
    rr(g, x, y2, kw, 44, 6); g.fillStyle = (r * 10 + i) === hit && typed.length < full.length ? '#b9bdba' : '#fff'; g.fill();
    text(ch, x + kw / 2, y2 + 29, { weight: 500, size: 19, align: 'center', color: '#111' }, g);
  }));
  rr(g, 96, SH - 124, 198, 44, 6); g.fillStyle = '#fff'; g.fill();
  rr(g, 20, SH - 124, 68, 44, 6); g.fillStyle = '#b6bab7'; g.fill(); rr(g, SW - 88, SH - 124, 68, 44, 6); g.fill();
  text('스페이스', SW / 2 - 1, SH - 96, { weight: 500, size: 14, align: 'center', color: '#555' }, g);
}
function scrReviewList(g, t) {
  g.fillStyle = '#f6f6f3'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  text('방문자 리뷰', 26, 102, { weight: 800, size: 28, color: C.uiInk }, g);
  [[COPY.r2, '★5 · 점심 · 데이트'], [COPY.r1, '★5 · 점심 · 나들이'], [COPY.r5, '★5 · 점심 · 바로 입장']].forEach(([r, meta], i) => {
    const y = 128 + i * 228;
    rr(g, 20, y, SW - 40, 212, 20); g.fillStyle = '#fff'; g.fill();
    g.fillStyle = ['#f6dcb0', '#c9d8f3', '#f3d0c0'][i]; g.beginPath(); g.arc(50, y + 34, 16, 0, TAU); g.fill();
    text(meta, 76, y + 40, { weight: 600, size: 13, color: C.uiMuted }, g);
    const words = r.split(' '); let line = '', yy = y + 76, n = 0;
    for (const w of words) { const tr = line ? line + ' ' + w : w; if (measure(tr, { weight: 500, size: 15 }, g) > SW - 84 && line) { text(line, 36, yy, { weight: 500, size: 15, color: C.uiInk }, g); yy += 24; line = w; if (++n >= 5) { line = ''; break; } } else line = tr; }
    if (line) text(line, 36, yy, { weight: 500, size: 15, color: C.uiInk }, g);
  });
}

/* ---------- 카드·글 도구 ---------- */
function quoteCard(g, w, h, quote, meta, tag, size = 22) {
  g.fillStyle = '#fff4c2'; g.beginPath(); g.arc(44, 42, 18, 0, TAU); g.fill();
  text('“', 44, 58, { weight: 800, size: 34, align: 'center', color: C.uiBtn }, g);
  text(meta, 74, 48, { weight: 600, size: 15, color: C.uiMuted }, g);
  const words = quote.split(' '); let line = '', yy = 92 + size * 0.3;
  words.forEach(wd => { const tr = line ? line + ' ' + wd : wd; if (measure(tr, { weight: 700, size }, g) > w - 64 && line) { text(line, 30, yy, { weight: 700, size, color: C.uiInk }, g); yy += size * 1.45; line = wd; } else line = tr; });
  text(line, 30, yy, { weight: 700, size, color: C.uiInk }, g);
  if (tag) { const tw = measure(tag, { weight: 700, size: 15 }, g) + 30; rr(g, 30, h - 52, tw, 32, 16); g.fillStyle = '#fff4c2'; g.fill(); text(tag, 45, h - 30, { weight: 700, size: 15, color: '#8a6a00' }, g); }
}
function pillCard(x, y, label, k, o2 = {}) {   // 둥근 배지 하나
  if (k <= 0) return;
  const size = o2.size ?? 26, tw = measure(label, { weight: 800, size }) + 56, hh = size * 2.3;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * (o2.alpha ?? 1);
  const s = 0.6 + 0.4 * eOutBack(clamp(k));
  ctx.translate(x + (o2.center ? 0 : tw / 2), y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = o2.fill ?? '#fff'; ctx.beginPath(); ctx.roundRect(-tw / 2, -hh / 2, tw, hh, hh / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  text(label, 0, size * 0.36, { weight: 800, size, align: 'center', color: o2.color ?? '#8a6a00' });
  ctx.restore();
}
const pillW = (label, size = 26) => measure(label, { weight: 800, size }) + 56;
// 왼쪽(가로) / 위쪽(세로) 글 묶음 자리
const TXT = { x: o(120, 80), eb: o(438, 230), hd: o(530, 330), hdS: o(84, 84) };
const subY = (lines2, size = TXT.hdS) => TXT.hd + (lines2 - 1) * size * 1.1 + o(70, 66);
// 휴대폰 기본 자리
const PHX = o(W * 0.72, W / 2), PHY = o(H / 2 + 10, H * 0.64), PHS = o(0.95, 1.0);

/* ============================================================
   8. 장면
   ============================================================ */
// ① 미슐랭 맛집, STAY → 휴대폰
function sHook(lt, t) {
  background(t, W * 0.6, H * 0.45, 0.9 + 0.1 * Math.sin(t * 2));
  const enter = eInOutQuint(prog(lt, 1.15, 2.1));
  const sz = lerp(o(86, 92), o(74, 84), enter);
  if (!V) {   // 가로: 한 줄로 가운데 → 왼쪽으로 (왼쪽 끝을 이어서 움직여 튀지 않게)
    const one = [[['미슐랭 맛집, ', C.fg], ['STAY.', C.acc]]];
    const tw = measure('미슐랭 맛집, STAY.', { ...HEAD, size: sz });
    blurHead(one, lerp(W / 2 - tw / 2, 150, enter), H / 2 + 34, lt, 0.25, { size: sz });
  } else {
    const tw = measure('미슐랭 맛집,', { ...HEAD, size: sz });
    blurHead([[['미슐랭 맛집,', C.fg]], [['STAY.', C.acc]]], lerp(W / 2 - tw / 2, TXT.x, enter), lerp(H * 0.44, TXT.hd, enter), lt, 0.25, { size: sz });
  }
  if (lt > 1.0) {
    const zoom = eInCubic(prog(lt, 2.4, 3.0));
    if (!V) {
      const px = (l) => lerp(W + 420, W * 0.72, eOutExpo(prog(l, 1.1, 2.0)));
      phone(lerp(px(lt), W / 2, zoom), lerp(H / 2 + 20, H / 2 + 60, zoom), scrHero, t, { s: lerp(0.98, 2.6, zoom), vx: vel(px, lt) * 1.2 });
    } else {
      const py = (l) => lerp(H + 600, PHY, eOutExpo(prog(l, 1.1, 2.0)));
      phone(W / 2, lerp(py(lt), H * 0.55, zoom), scrHero, t, { s: lerp(PHS, 2.4, zoom), vy: vel(py, lt) * 1.2 });
    }
  }
}
// ② 카놀리 사진 속으로 — 리뷰 키워드
function sScan(lt, t, d) {
  const z = 1.0 + 0.05 * lt;
  const R0 = o({ x: W * 0.4, y: 0, w: W * 0.6, h: H }, { x: 0, y: H * 0.36, w: W, h: H * 0.64 });
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  cover(ctx, CACHE.cannoli, R0.x, R0.y, R0.w, R0.h, z, 0.5, o(0.4, 0.45));
  const gl = V ? ctx.createLinearGradient(0, R0.y, 0, R0.y + 300) : ctx.createLinearGradient(R0.x, 0, R0.x + 300, 0);
  gl.addColorStop(0, 'rgba(8,8,10,1)'); gl.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
  const out = 1 - sstep(d - 0.3, d, lt);
  const k = prog(lt, 0.2, 1.4), cx = R0.x + R0.w * o(0.56, 0.5), cy = R0.y + R0.h * o(0.52, 0.48), R = 74;
  ctx.save(); ctx.globalAlpha = clamp(lt * 3) * out;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = C.acc; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * eOutCubic(k)); ctx.stroke();
  text(`${Math.round(eOutCubic(k) * 100)}%`, cx, cy + 11, { weight: 700, size: 30, align: 'center', color: '#fff' });
  text(k < 1 ? '리뷰 키워드 찾는 중...' : '리뷰 키워드', cx, cy + R + 48, { weight: 700, size: 23, align: 'center', color: '#fff', shadow: 'rgba(0,0,0,0.85)' });
  ctx.restore();
  [['뷰가 참 예쁘고', -0.95, -0.55, 0.9], ['와인 페어링', 0.95, -0.45, 1.1], ['섬세한 플레이팅', -0.95, 0.55, 1.3], ['센스짱', 0.9, 0.6, 1.5]].forEach(([w, dx, dy, at]) =>
    pillCard(cx + dx * o(250, 270), cy + dy * o(230, 300), w, prog(lt, at, at + 0.35), { center: true, size: 30, alpha: out }));
  eyebrow('REVIEW SCAN', TXT.x, TXT.eb, lt, 0.2, d - 0.35);
  blurHead([[['리뷰가 말하는', C.fg]], [['그 한 접시.', C.acc]]], TXT.x - 2, TXT.hd, lt, 0.3, { size: TXT.hdS, out: d - 0.35 });
  subline('방문 리뷰에 적힌 말 그대로', TXT.x + 2, subY(2), lt, 0.9, d - 0.35);
}
// ③ '미슐랭 맛집' 도장 쾅 + 미쉐린 3스타 셰프 야닉 알레노 + 창의적인 프랑스 요리
function sSeal(lt, t, d) {
  background(t, o(W * 0.3, W * 0.4), o(H * 0.4, H * 0.3));
  const out = d - 0.35, fade = 1 - sstep(d - 0.3, d, lt);
  const inK = eOutExpo(prog(lt, 0, 0.55));
  const scr = (g, tt) => scrDish(g, tt, CACHE.hall, 'STAY', '시그니엘 서울 81층 · 프렌치', ['미슐랭 맛집', '런치', '디너'], '예약하기', { seal: true, boxTitle: '가게 소개글', boxSub: '“창의적인 프랑스 요리를 선보입니다”' });
  if (!V) phone(lerp(W * 0.86, PHX, inK), PHY, scr, t, { s: PHS, alpha: clamp(lt * 4) });
  else phone(PHX, lerp(H + 400, PHY + 160, inK), scr, t, { s: PHS * 0.88, alpha: clamp(lt * 4) });
  // 도장: 크게 떠 있다가 쾅 (0.6초)
  const sx = TXT.x + o(160, 170), sy = o(330, 420), r = o(150, 170);
  const sk = prog(lt, 0.2, 0.6);
  if (sk > 0) {
    const bk = prog(lt, 0.6, 0.95), s = lerp(2.3, 1, eInCubic(sk)) - Math.sin(bk * Math.PI) * 0.06;
    ctx.save(); ctx.globalAlpha = clamp(sk * 3) * fade;
    ctx.translate(sx, sy); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20 * s;
    sealBadge(ctx, 0, 0, r, { rot: lerp(-0.4, -0.08, eOutCubic(sk)) });
    ctx.restore();
    const wk = prog(lt, 0.6, 1.4);
    if (wk > 0 && wk < 1) {
      ctx.save(); ctx.globalAlpha = (1 - wk) * 0.8 * fade; ctx.strokeStyle = C.acc; ctx.lineWidth = 4 * (1 - wk) + 1;
      ctx.shadowColor = C.acc; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(sx, sy, r * (1.02 + eOutCubic(wk) * 0.9), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  // 도장 오른쪽: 셰프 이름
  const nx = sx + r + o(50, 46);
  eyebrow('MICHELIN 3-STAR CHEF', nx, sy - o(34, 40), lt, 0.8, out);
  blurHead([[[COPY.chef, C.fg]]], nx - 2, sy + o(40, 40), lt, 0.9, { size: o(60, 62), out });
  // 아래: 창의적인 프랑스 요리
  const hy = o(610, 730);
  blurHead([[['창의적인 ', C.fg], ['프랑스 요리.', C.acc]]], TXT.x, hy, lt, 1.2, { size: o(60, 62), out });
  subline('“미쉐린 3스타 셰프 \'야닉 알레노\'” — 가게 소개글', TXT.x + 3, hy + 58, lt, 1.5, out, { size: o(27, 26) });
  const ck = prog(lt, 1.7, 2.2);
  card(lerp(TXT.x + 80, TXT.x, eOutCubic(ck)), hy + o(96, 98), o(640, 640), 108, ck * fade, (g, w, h) => {
    text('편의시설 및 서비스', 26, 36, { weight: 700, size: 15, color: C.uiMuted }, g);
    let x = 26; ['와인 페어링', '소믈리에', '글루텐프리', '비건 메뉴'].forEach((c, i) => { const w2 = measure(c, { weight: 800, size: 19 }, g) + 30; rr(g, x, 52, w2, 38, 19); g.fillStyle = ['#fff4c2', '#f3efe0', '#e9f2e4', '#e4f0e8'][i]; g.fill(); text(c, x + 15, 78, { weight: 800, size: 19, color: ['#8a6a00', '#6b5a2a', '#3f6a2e', '#2e6a4a'][i] }, g); x += w2 + 10; });
  });
}
// ④ 한 코스, 한 코스 (기울어진 화면 + 리뷰 카드)
function sTilt(lt, t, d) {
  background(t, o(W * 0.35, W * 0.5), o(H * 0.5, H * 0.7));
  const tk = eOutCubic(prog(lt, 0, 0.5)), out = d - 0.35;
  const scr = (g, tt) => scrDish(g, tt, CACHE.volau, '코스 한 접시', '바삭한 페이스트리 · 하얀 살 · 크림 소스', ['섬세한 플레이팅', '조화로운 풍미'], '예약하기', { zoom: 0.05 * lt, boxTitle: '방문 리뷰', boxSub: '“셰프의 정성이 느껴졌고”' });
  if (!V) phone(lerp(W * 0.6, W * 0.34, tk), H / 2 + 20, scr, t, { s: 0.92, rot: lerp(0, -0.7, tk), tilt: lerp(0, -0.12, tk), vx: lt < 0.4 ? -30 * (1 - tk) : 0 });
  else phone(lerp(W * 0.5, W * 0.6, tk), H * 0.7, scr, t, { s: 0.92, rot: lerp(0, -0.6, tk), tilt: lerp(0, -0.1, tk) });
  const hx = o(W * 0.53, TXT.x), hy = o(400, TXT.hd);
  blurHead([[['한 코스,', C.fg]], [['한 코스.', C.acc]]], hx, hy, lt, 0.25, { size: o(82, 86), out });
  const ck = prog(lt, 0.9, 1.4);
  card(o(W * 0.53, TXT.x - 10), o(520, 560), o(800, 940), 200, ck * (1 - sstep(out, d, lt)), (g, w, h) => quoteCard(g, w, h, COPY.r3, '방문 리뷰 · ★5 · 저녁 · 친구', null, 28));
}
// ⑤ 산미와 감칠맛, 소스가 킥 (맛 배지)
function sSauce(lt, t, d) {
  background(t, o(W * 0.68, W * 0.5), o(H * 0.45, H * 0.7));
  const k = eOutCubic(prog(lt, 0, 0.5)), out = d - 0.35;
  const scr = (g, tt) => scrDish(g, tt, CACHE.shrimp, '새우와 벌집꿀', '윤기 나는 소스 · 벌집꿀 한 조각', ['소스', '산미', '감칠맛'], '예약하기', { zoom: 0.04 * lt, boxTitle: '방문 리뷰', boxSub: '“소스가 하나의 킥이었다”' });
  if (!V) phone(lerp(W * 0.38, W * 0.72, k), H / 2 + 14, scr, t, { s: 0.95, rot: lerp(-0.7, 0, k), tilt: lerp(-0.12, 0, k) });
  else phone(lerp(W * 0.62, W / 2, k), PHY + 40, scr, t, { s: PHS * 0.95, rot: lerp(-0.6, 0, k), tilt: lerp(-0.1, 0, k) });
  const x0 = TXT.x + o(20, 0);
  eyebrow('REVIEW KEYWORD', x0, o(380, TXT.eb), lt, 0.2, out);
  blurHead([[['산미와 감칠맛,', C.fg]], [['소스가 킥.', C.acc]]], x0, o(470, TXT.hd), lt, 0.35, { size: o(86, 86), out });
  subline('“소스가 하나의 킥이었다” — 방문 리뷰 (랍스터 요리)', x0 + 4, o(630, subY(2, 86)), lt, 1.0, out, { size: o(27, 25) });
  const by = o(712, subY(2, 86) + 74), labs = ['신선도', '식감', '산미', '감칠맛'];
  text('리뷰에 적힌 맛', x0 + 4, by - 52, { weight: 600, size: 20, color: 'rgba(247,246,242,0.55)', alpha: prog(lt, 1.2, 1.5) * (1 - prog(lt, out, d)) });
  let px = x0;
  labs.forEach((l, i) => { pillCard(px, by, l, prog(lt, 1.3 + i * 0.12, 1.75 + i * 0.12) * (1 - prog(lt, out, d)), { size: 22 }); px += pillW(l, 22) + 12; });
}
// ⑥ 런치 · 디너 · 와인 페어링 · 글루텐프리 · 비건 → 카놀리 + 리뷰
function sMenu(lt, t, d) {
  background(t, o(W * 0.35, W * 0.5), o(H * 0.45, H * 0.6));
  const whipIn = (x) => o(lerp(-500, W * 0.3, eOutExpo(prog(x, 0, 0.55))), lerp(-600, W / 2, eOutExpo(prog(x, 0, 0.55))));
  const detail = sstep(2.6, 3.1, lt);
  const scroll = -140 * (1 - eOutCubic(prog(lt, 0.4, 1.6)));
  const scr = (g, tt) => {
    scrMenu(g, tt, scroll);
    if (detail > 0) { g.save(); g.globalAlpha = detail; scrDish(g, tt, CACHE.cannoli, '캐비아 카놀리', '바삭한 셸 · 캐비아 · 크림', ['런치', '디너', '와인 페어링'], '예약하기', { boxTitle: '방문 리뷰', boxSub: '“뷰가 참 예쁘고 좋더라구요”' }); g.restore(); }
  };
  const zoomK = eInOutCubic(prog(lt, 2.7, 3.3));
  if (!V) phone(whipIn(lt) + zoomK * 40, H / 2 + 10 + zoomK * 40, scr, t, { s: 0.95 + zoomK * 0.1, vx: vel(whipIn, lt) });
  else phone(whipIn(lt), PHY + 60 + zoomK * 40, scr, t, { s: PHS * 0.95, vx: vel(whipIn, lt) });
  const hx = o(W * 0.53, TXT.x), out1 = 2.4;
  eyebrow('LUNCH & DINNER', hx, o(400, TXT.eb), lt, 0.35, out1);
  blurHead([[['런치부터', C.fg]], [['디너까지.', C.acc]]], hx, o(490, TXT.hd), lt, 0.4, { size: o(80, 80), out: out1 });
  subline('와인 페어링 · 글루텐프리 · 비건 메뉴까지 (편의시설 안내)', hx + 3, o(640, subY(2, 80)), lt, 0.9, out1, { size: o(27, 24) });
  const ck = prog(lt, 3.2, 3.8);
  const vc = o({ x: W * 0.48, y: 190, w: 700, h: 470 }, { x: 60, y: 150, w: 560, h: 376 });
  card(vc.x, vc.y, vc.w, vc.h, ck * (1 - sstep(d - 0.3, d, lt)), (g, w, h) => {
    cover(g, CACHE.shrimp, 0, 0, w, h, 1.0, 0.5, 0.55);
    g.fillStyle = lin(g, 0, h * 0.5, 0, h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.65)']]); g.fillRect(0, 0, w, h);
    text('새우 · 벌집꿀 · 초록 크림 한 접시', 24, h - 24, { weight: 700, size: o(22, 19), color: '#fff' }, g);
  }, { r: 24 });
  const ck2 = prog(lt, 3.8, 4.3);
  const qc = o({ x: W * 0.5, y: 700, w: 820, h: 190 }, { x: 330, y: 500, w: 690, h: 200 });
  card(qc.x, qc.y, qc.w, qc.h, ck2 * (1 - sstep(d - 0.3, d, lt)), (g, w, h) => quoteCard(g, w, h, COPY.r2w, '방문 리뷰 · ★5 · 점심 · 데이트', null, 26));
}
// ⑦ (보라) 리뷰 — 타자 + 카드 두 장
function sReviews(lt, t, d) {
  background(t, o(W * 0.72, W * 0.5), o(H * 0.45, H * 0.7));
  const k = eOutExpo(prog(lt, 0.05, 0.6));
  const typed = COPY.r5.slice(0, Math.floor(clamp((lt - 0.6) * 28, 0, COPY.r5.length)));
  const scr = (g, tt) => scrReview(g, tt, typed, prog(lt, 1.0, 3.0), COPY.r5);
  const shrink = eInOutCubic(prog(lt, 4.0, 4.7));
  if (!V) phone(lerp(W * 0.95, W * 0.74, k), H / 2 + 14, scr, t, { s: 0.98 });
  else phone(W / 2, lerp(H + 500, PHY + 60, k) + eInCubic(prog(lt, 4.0, 4.7)) * 1100, scr, t, { s: PHS * 0.95 });
  eyebrow('REVIEWS', TXT.x, lerp(o(410, TXT.eb), o(168, 150), shrink), lt, 0.3);
  const sz = lerp(o(76, 70), 34, shrink), x0 = TXT.x - 2, y0 = lerp(o(510, TXT.hd), o(236, 216), shrink);
  const l1 = COPY.r4a, l2 = COPY.r4b, n = Math.floor(clamp((lt - 0.6) * 9, 0, l1.length + l2.length));
  const s1 = l1.slice(0, Math.min(n, l1.length)), s2 = n > l1.length ? l2.slice(0, n - l1.length) : '';
  text(s1, x0, y0, { ...HEAD, size: sz });
  text(s2, x0, y0 + sz * 1.12, { ...HEAD, size: sz, color: C.acc });
  if (n < l1.length + l2.length && Math.floor(lt * 2.5) % 2 === 0) { ctx.fillStyle = C.acc; ctx.fillRect(x0 + measure(n > l1.length ? s2 : s1, { ...HEAD, size: sz }) + 8, y0 + (n > l1.length ? sz * 1.12 : 0) - sz * 0.8, 4, sz * 0.9); }
  subline('방문 리뷰 · ★5 · 저녁 · 데이트', x0 + 4, y0 + sz * 1.12 + 60 * (1 - shrink) + 40, lt, 2.6);
  const c1 = o({ x: W * 0.2, y: 320, w: 700, h: 230 }, { x: 70, y: 380, w: 940, h: 230 });
  const c2 = o({ x: W * 0.27, y: 570, w: 660, h: 200 }, { x: 110, y: 670, w: 900, h: 220 });
  card(c1.x, c1.y, c1.w, c1.h, prog(lt, 4.7, 5.3), (g, w, h) => quoteCard(g, w, h, COPY.r4v, '방문 리뷰 · 저녁 · 데이트', '★ 5', 24), { rot: -0.02 });
  card(c2.x, c2.y, c2.w, c2.h, prog(lt, 5.3, 5.9), (g, w, h) => quoteCard(g, w, h, COPY.r5b, '방문 리뷰 · 점심 · 아기 100일잔치', '★ 5', 26), { rot: 0.015 });
  if (V && lt > 5.6) phone(W / 2, lerp(H + 500, H * 0.87, eOutExpo(prog(lt, 5.6, 6.3))), scrReviewList, t, { s: 0.82 });   // 세로: 아래 빈자리에 리뷰 목록
  blurHead([[['모임이나 기념일에 ', C.fg], ['딱 좋은 곳.', C.acc]]], o(118, W / 2), o(880, 1100), lt, 6.1, { size: o(66, 66), align: o('left', 'center') });
}
// ⑧ (밤 파랑) 접객은, 말할 것 없이 — 시그니엘 입구
function sService(lt, t, d) {
  background(t, o(W * 0.55, W * 0.5), o(H * 0.5, H * 0.66));
  const k = eOutExpo(prog(lt, 0.05, 0.6)), out = d - 0.35, fade = 1 - sstep(d - 0.3, d, lt);
  const cx = o(W * 0.6, W / 2), cy = o(H / 2 + 30, PHY + 40);
  for (let i = 0; i < 3; i++) {
    if (lt < 1.0) break;
    const ph = ((lt - 1.0) * 0.6 + i / 3) % 1;
    ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8 * fade;
    ctx.strokeStyle = 'rgba(150,200,255,0.9)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(120,180,255,0.8)'; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.ellipse(cx, cy + 180, 200 + ph * 420, 160 + ph * 330, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  phone(cx, lerp(H + 500, cy, k), (g, tt) => scrDish(g, tt, CACHE.door, '시그니엘 서울', '대리석 입구 · 금빛 유리문', ['예약', '단체 이용', '휠체어 이용'], '예약하기', { zoom: 0.03 * lt, boxTitle: '방문 리뷰', boxSub: '“서비스도 깔끔하고 좋았어요”' }), t, { s: o(1.0, PHS), vy: lt < 0.6 ? -40 * (1 - k) : 0 });
  // 입구 위 SIGNIEL 글자 사진 카드
  const sk = prog(lt, 0.7, 1.2);
  const sc = o({ x: W * 0.6 + 250, y: 150, w: 380, h: 224 }, { x: W - 80 - 360, y: 596, w: 360, h: 212 });
  card(sc.x, sc.y, sc.w, sc.h, sk * fade, (g, w, h) => cover(g, CACHE.sign, 0, 0, w, h, 1.0), { r: 22, rot: 0.03 });
  eyebrow('HOSPITALITY', TXT.x, TXT.eb, lt, 0.3, out);
  blurHead([[['접객은,', C.fg]], [['말할 것 없이.', C.acc]]], TXT.x - 2, TXT.hd, lt, 0.4, { size: TXT.hdS + 4, out });
  subline('“접객은 말할 것 없이 좋았고” — 방문 리뷰', TXT.x + 2, subY(2, TXT.hdS + 4), lt, 0.9, out);
  const mo = { fam: 'Mono, NotoKR', weight: 400, size: o(27, 30) };
  [['+ 유모차 자리도 센스 있게', 1.3], ['+ 휠체어 이용 가능', 1.8], ['+ 단체 이용 가능', 2.3]].forEach(([s2, at], i) => {
    const kk = prog(lt, at, at + 0.5);
    if (kk <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(kk * 2) * fade;
    let lx, ly;
    if (!V) { lx = cx + 290; ly = cy - 30 + i * 100 - eOutCubic(kk) * 30; }   // 가로: 모두 휴대폰 오른쪽
    else { lx = TXT.x + 4; ly = subY(2, TXT.hdS + 4) + 86 + i * 62 - eOutCubic(kk) * 20; }
    text(s2, lx, ly, { ...mo, color: 'rgba(200,225,255,0.96)', shadow: 'rgba(120,180,255,0.6)' });
    ctx.restore();
  });
}
// ⑨ 화면 다섯 개
function sMontage(lt, t, d) {
  background(t, W * 0.5, H * 0.62);
  const screens = [
    (g, tt) => scrReviewList(g, tt),
    (g, tt) => scrMenu(g, tt, 0),
    (g, tt) => scrHero(g, tt),
    (g, tt) => scrDish(g, tt, CACHE.volau, '코스 한 접시', '바삭한 페이스트리 · 크림 소스', ['섬세한 플레이팅', '조화로운 풍미'], '예약하기', { boxSub: '“셰프의 정성이 느껴졌고”' }),
    (g, tt) => scrDish(g, tt, CACHE.shrimp, '새우와 벌집꿀', '윤기 나는 소스 · 벌집꿀 한 조각', ['소스', '산미', '감칠맛'], '예약하기', { boxSub: '“소스가 하나의 킥이었다”' }),
  ];
  const out = eInCubic(prog(lt, d - 0.6, d));
  const sp = o(330, 205), base = o(0.6, 0.43), mid = o(0.68, 0.52), yy = o(H * 0.6, H * 0.6);
  screens.forEach((fn, i) => {
    const off = i - 2, kk = eOutExpo(prog(lt, 0.1 + Math.abs(off) * 0.12, 0.8 + Math.abs(off) * 0.12));
    const x = W / 2 + off * sp * lerp(0.6, 1, kk), y = yy + (1 - kk) * 500 + Math.abs(off) * o(14, 30) + out * 900;
    phone(x, y, fn, t, { s: i === 2 ? mid : base, rot: -off * 0.32, alpha: clamp(kk * 2) });
  });
  const swap = 3.2, ty = o(190, H * 0.28);
  ctx.save(); ctx.globalAlpha = 1 - out;
  if (lt < swap + 0.2) blurHead([[['섬세하게. ', C.fg], ['조화롭게. ', C.fg], ['특별하게.', C.acc]]], W / 2, ty, lt, 0.4, { size: o(72, 66), align: 'center', out: swap - 0.3 });
  if (lt > swap - 0.1) {
    if (!V) blurHead([[['시그니엘 서울 미슐랭 맛집 ', C.fg], ['STAY.', C.acc]]], W / 2, ty, lt, swap, { size: 72, align: 'center' });
    else blurHead([[['시그니엘 서울 미슐랭 맛집', C.fg]], [['STAY.', C.acc]]], W / 2, ty - 40, lt, swap, { size: 70, align: 'center' });
  }
  ctx.restore();
}
// ⑩ STAY 실내 사진 + 가게 소개글: 서울 시내가 한눈에
function sStore(lt, t, d) {
  background(t, o(W * 0.7, W * 0.5), o(H * 0.45, H * 0.62));
  const k = eOutExpo(prog(lt, 0.05, 0.7)), out = d - 0.35;
  const cw = o(980, 940), ch = o(640, 660), cx = o(lerp(W + 500, W * 0.68, k), W / 2), cy = o(H / 2 + 10, lerp(H + 600, H * 0.64, k));
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(lerp(0.06, 0.012, k));
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 36); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 36); ctx.clip();
  cover(ctx, CACHE.hall, -cw / 2, -ch / 2, cw, ch, 1.04 + 0.04 * lt);
  const sx = lerp(-cw, cw, prog(lt, 1.0, 2.2));
  const gr = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0); gr.addColorStop(0, 'rgba(255,245,210,0)'); gr.addColorStop(0.5, 'rgba(255,245,210,0.26)'); gr.addColorStop(1, 'rgba(255,245,210,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(-cw / 2, -ch / 2, cw, ch * 0.6); ctx.restore();
  const lk = prog(lt, 1.3, 1.8);
  if (lk > 0) {
    const lab = '노란 의자 · 체크무늬 대리석 바닥 · 큰 창', lw = measure(lab, { weight: 700, size: 22 }) + 44;
    ctx.globalAlpha = eOutCubic(lk);
    ctx.fillStyle = 'rgba(8,8,10,0.72)'; ctx.beginPath(); ctx.roundRect(-cw / 2 + 28, ch / 2 - 80 + (1 - eOutCubic(lk)) * 16, lw, 50, 25); ctx.fill();
    text(lab, -cw / 2 + 50, ch / 2 - 47 + (1 - eOutCubic(lk)) * 16, { weight: 700, size: 22, color: '#fff' });
  }
  ctx.restore();
  eyebrow('81F · SIGNIEL SEOUL', TXT.x, o(388, TXT.eb), lt, 0.3, out);
  blurHead([[['서울 시내가', C.fg]], [['한눈에 들어오는', C.fg]], [['81층 전망.', C.acc]]], TXT.x - 2, o(480, TXT.hd), lt, 0.4, { size: o(70, 78), out });
  subline('— STAY 가게 소개글에서', TXT.x + 2, o(480 + 2 * 70 * 1.1 + 70, subY(3, 78)), lt, 1.2, out);
}
// ⑪ 약도 + 주소 (받은 지도를 보고 다시 그린 약도)
function drawMiniMap(g, w, h, lt) {
  const sx = w / 1000, sy = h / 620;
  g.save(); g.scale(sx, sy);
  g.fillStyle = '#f0efe9'; g.fillRect(0, 0, 1000, 620);
  // 석촌호수 (동호 · 서호) + 둘레 녹지
  g.fillStyle = '#d6e9cc';
  g.save(); g.translate(690, 385); g.rotate(-0.35); g.beginPath(); g.ellipse(0, 0, 175, 120, 0, 0, TAU); g.fill(); g.restore();
  g.beginPath(); g.ellipse(390, 640, 210, 95, -0.1, 0, TAU); g.fill();
  g.fillStyle = '#a9d3ef';
  g.save(); g.translate(690, 385); g.rotate(-0.35); g.beginPath(); g.ellipse(0, 0, 150, 96, 0, 0, TAU); g.fill(); g.restore();
  g.beginPath(); g.ellipse(390, 650, 180, 70, -0.1, 0, TAU); g.fill();
  // 블록
  g.fillStyle = '#e5e3dc';
  [[30, 20, 150, 110], [210, 20, 130, 90], [600, 20, 150, 70], [790, 20, 180, 60], [30, 360, 170, 90], [30, 470, 140, 80], [620, 150, 150, 70], [830, 150, 150, 120], [860, 330, 120, 140], [420, 300, 120, 140]]
    .forEach(([x, y, w2, h2]) => { rr(g, x, y, w2, h2, 8); g.fill(); });
  // 롯데월드타워 자리 (핀 둘레)
  g.fillStyle = '#e0ddd3'; rr(g, 390, 250, 140, 110, 12); g.fill();
  // 길
  g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 40; g.beginPath(); g.moveTo(0, 330); g.lineTo(560, 175); g.lineTo(1000, 70); g.stroke();   // 올림픽로
  g.lineWidth = 26; g.beginPath(); g.moveTo(345, 0); g.lineTo(380, 250); g.lineTo(340, 620); g.stroke();   // 남북 큰길
  g.lineWidth = 12; [[[560, 175], [600, 620]], [[0, 200], [345, 120]], [[780, 120], [1000, 290]]].forEach(([[a, b], [c, dd]]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, dd); g.stroke(); });
  // 2호선 (초록) · 8호선 (분홍)
  g.strokeStyle = '#3cb44a'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 318); g.lineTo(560, 163); g.lineTo(1000, 58); g.stroke();
  g.lineWidth = 22; g.beginPath(); g.moveTo(180, 268); g.lineTo(470, 188); g.stroke();
  g.strokeStyle = '#e6187d'; g.lineWidth = 8; g.beginPath(); g.moveTo(1000, 20); g.lineTo(650, 120); g.lineTo(400, 225); g.lineTo(330, 330); g.lineTo(350, 620); g.stroke();
  g.lineWidth = 22; g.beginPath(); g.moveTo(520, 160); g.lineTo(650, 120); g.stroke();
  const badge = (x, y, n2, col) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 15, 0, TAU); g.fill(); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); text(n2, x, y + 6, { weight: 800, size: 16, align: 'center', color: col }, g); };
  badge(250, 248, '2', '#3cb44a'); text('잠실역', 275, 225, { weight: 800, size: 22, color: '#2a2a2a' }, g);
  badge(600, 135, '8', '#e6187d'); text('잠실역', 625, 112, { weight: 800, size: 22, color: '#2a2a2a' }, g);
  text('올림픽로', 760, 98, { weight: 600, size: 16, color: '#9a9488' }, g);
  // 둘레 장소 (받은 지도에 적힌 곳)
  const poi = (x, y, label, col, right = true) => {
    g.fillStyle = col; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
    text(label, x + (right ? 16 : -16), y + 6, { weight: 700, size: 17, align: right ? 'left' : 'right', color: '#5d5850' }, g);
  };
  poi(570, 222, '롯데마트', '#e0873a');
  poi(712, 180, '송파구청', '#6f8fc0');
  poi(230, 140, '롯데캐슬골드', '#8a8a8a');
  poi(250, 350, '롯데백화점', '#9b84c8', false);
  poi(220, 410, '롯데호텔월드', '#9b84c8', false);
  text('롯데월드', 90, 500, { weight: 800, size: 22, color: '#5d5850' }, g);
  text('석촌호수 (동호)', 690, 392, { weight: 700, size: 18, align: 'center', color: '#3a7aa6' }, g);
  text('석촌호수', 400, 606, { weight: 700, size: 18, align: 'center', color: '#3a7aa6' }, g);
  g.restore();
  return { pinX: 455 * sx, pinY: 300 * sy };
}
function sMap(lt, t, d) {
  background(t, o(W * 0.68, W * 0.5), o(H * 0.45, H * 0.6));
  const k = eOutExpo(prog(lt, 0.05, 0.7)), out = d - 0.3;
  const mw = o(1080, 980), mh = o(668, 608), mx = o(lerp(W + 200, 760, k), (W - 980) / 2), my = o((H - mh) / 2 + 10, lerp(H + 300, 640, k));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 34;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 30); ctx.clip();
  ctx.translate(mx, my);
  const { pinX, pinY } = drawMiniMap(ctx, mw, mh, lt);
  const pk = prog(lt, 1.0, 1.5);
  for (let i = 0; i < 3; i++) {
    if (lt < 1.4) break;
    const ph = ((lt - 1.4) * 0.7 + i / 3) % 1;
    ctx.strokeStyle = `rgba(226,96,58,${0.75 * (1 - ph)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(pinX, pinY, 20 + ph * 120, (20 + ph * 120) * 0.6, 0, 0, TAU); ctx.stroke();
  }
  if (pk > 0) {
    const drop = (1 - eOutBack(pk)) * -80;
    ctx.save(); ctx.translate(pinX, pinY + drop);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, -drop, 16, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#E2603A'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -36, -30, -78, 0, -80); ctx.bezierCurveTo(30, -78, 30, -36, 0, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -52, 11, 0, TAU); ctx.fill();
    ctx.restore();
    const lk = prog(lt, 1.4, 1.9);
    if (lk > 0) {
      const lab = 'STAY · 미슐랭 맛집 · 81층', tw = measure(lab, { weight: 800, size: 22 }) + 40;
      ctx.save(); ctx.globalAlpha = lk;
      ctx.fillStyle = '#141416'; ctx.beginPath(); ctx.roundRect(pinX - tw / 2, pinY + 26, tw, 46, 23); ctx.fill();   // 받은 지도처럼 핀 아래에 이름
      text(lab, pinX, pinY + 57, { weight: 800, size: 22, align: 'center', color: '#fff' });
      ctx.restore();
    }
  }
  ctx.restore();
  eyebrow('LOCATION', TXT.x, o(330, TXT.eb), lt, 0.3, out);
  blurHead([[[COPY.addr1, C.fg]], [[COPY.addr2, C.acc]]], TXT.x - 2, o(422, TXT.hd), lt, 0.4, { size: o(84, 84), out });
  const ly0 = o(600, 1320);
  [[COPY.floor, 1.4, true], [COPY.subway, 1.65, true], ['☎ ' + COPY.tel, 1.9, false], [COPY.hours, 2.15, false], [COPY.brk, 2.4, false], [COPY.park, 2.65, false]].forEach(([s2, at, hi], i) => {
    const kk = prog(lt, at, at + 0.4) * (1 - prog(lt, out, out + 0.3));
    if (kk <= 0) return;
    const y = ly0 + i * o(58, 62);
    ctx.save(); ctx.globalAlpha = eOutCubic(kk);
    ctx.fillStyle = hi ? C.acc : 'rgba(247,246,242,0.4)'; ctx.beginPath(); ctx.arc(TXT.x + 10, y - 10, 6, 0, TAU); ctx.fill();
    text(s2, TXT.x + 32 + (1 - eOutCubic(kk)) * 20, y, { weight: 700, size: o(30, 34), color: hi ? C.fg : 'rgba(247,246,242,0.78)' });
    ctx.restore();
  });
}
// ⑫ 미슐랭 맛집 도장 + STAY + 잊지 못할 다이닝
function sEnd(lt, t, d) {
  background(t, W / 2, H * 0.42, 0.85);
  ctx.save(); ctx.globalAlpha = 0.32 * sstep(0, 1.2, lt); ctx.filter = 'blur(16px) brightness(0.5) saturate(1.1)';
  cover(ctx, CACHE.hall, -40, -40, W + 80, H + 80, 1.05 + 0.01 * lt); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, 100, W / 2, H * 0.5, Math.max(W, H) * 0.6); vg.addColorStop(0, 'rgba(8,8,10,0.55)'); vg.addColorStop(1, 'rgba(8,8,10,0.86)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const pk = prog(lt, 0.1, 0.5);
  if (pk > 0) {
    const s = lerp(1.8, 1, eInCubic(pk)), r = o(78, 100);
    ctx.save(); ctx.globalAlpha = clamp(pk * 3); ctx.translate(W / 2, o(H * 0.2, H * 0.23)); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    sealBadge(ctx, 0, 0, r, { rot: -0.06 });
    ctx.restore();
  }
  const by = o(H * 0.5, H * 0.42), size = o(190, 200);
  const bz = { weight: 800, size, ls: 6 };
  const tw = measure(COPY.brand, bz), x0 = W / 2 - tw / 2;
  const wk = eOutCubic(prog(lt, 0.4, 1.1));
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, by - size, (tw + 40) * wk, size * 1.4); ctx.clip();
  text(COPY.brand, x0 - (1 - wk) * 40, by, { ...bz, color: C.fg });
  ctx.restore();
  text(COPY.tag, W / 2, by + 66, { fam: 'Mono', weight: 400, size: o(22, 20), ls: o(9, 4), align: 'center', color: C.acc, alpha: prog(lt, 1.0, 1.5) });
  blurHead([[['잊지 못할 ', C.fg], ['다이닝.', C.acc]]], W / 2, o(H * 0.68, H * 0.56), lt, 1.4, { size: o(56, 64), align: 'center', weight: 800 });
  subline('— STAY 가게 소개글에서', W / 2, o(H * 0.68, H * 0.56) + 50, lt, 1.8, null, { align: 'center' });
  const ik = prog(lt, 2.2, 2.8);
  if (ik > 0) {
    ctx.save(); ctx.globalAlpha = eOutCubic(ik);
    const ly = o(H * 0.77, H * 0.68);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(W / 2 - o(560, 420), ly, o(1120, 840), 1.5);
    if (!V) {
      text(`서울 송파구 올림픽로 300 · ${COPY.floor} · ${COPY.subway}`, W / 2, ly + 62, { weight: 600, size: 30, align: 'center', color: C.fg });
      text(`☎ ${COPY.tel}`, W / 2, ly + 112, { weight: 500, size: 28, align: 'center', color: 'rgba(247,246,242,0.72)' });
    } else {
      text('서울 송파구 올림픽로 300', W / 2, ly + 70, { weight: 700, size: 38, align: 'center', color: C.fg });
      text(`${COPY.floor} · ${COPY.subway}`, W / 2, ly + 126, { weight: 600, size: 30, align: 'center', color: 'rgba(247,246,242,0.85)' });
      text(`☎ ${COPY.tel}`, W / 2, ly + 186, { weight: 600, size: 34, align: 'center', color: 'rgba(247,246,242,0.75)' });
    }
    ctx.restore();
  }
  const end = sstep(d - 0.6, d, lt);
  if (end > 0) { ctx.fillStyle = `rgba(0,0,0,${end * 0.85})`; ctx.fillRect(0, 0, W, H); }
}

const SCENES = [
  [T.hook, sHook], [T.scan, sScan], [T.seal, sSeal], [T.tilt, sTilt], [T.sauce, sSauce], [T.menu, sMenu],
  [T.reviews, sReviews], [T.service, sService], [T.montage, sMontage], [T.store, sStore], [T.map, sMap], [T.end, sEnd],
];

/* ---------- 7. 휴대폰 본체 ---------- */
const PW = 430, PH = 880, PR = 1.5;   // 화면 밖 캔버스 해상도 배율
const PHONE = mk(Math.round(PW * PR), Math.round(PH * PR));
const PC = PHONE.getContext('2d');
function renderPhone(screenFn, t) {
  const g = PC;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PHONE.width, PHONE.height);
  g.scale(PR, PR);
  // 옆 버튼
  g.fillStyle = '#3a3836'; rr(g, -3, 190, 6, 60, 3); g.fill(); rr(g, -3, 270, 6, 90, 3); g.fill(); rr(g, PW - 3, 250, 6, 110, 3); g.fill();
  // 테두리(티타늄)
  rr(g, 0, 0, PW, PH, 68); g.fillStyle = lin(g, 0, 0, PW, PH, [[0, '#6d6a66'], [0.5, '#2c2a28'], [1, '#55524e']]); g.fill();
  rr(g, 5, 5, PW - 10, PH - 10, 63); g.fillStyle = '#050505'; g.fill();
  // 화면
  const sx = (PW - SW) / 2, sy = (PH - SH) / 2;
  g.save(); rr(g, sx, sy, SW, SH, 52); g.clip(); g.translate(sx, sy);
  screenFn(g, t);
  island(g);
  g.restore();
  // 유리 반사
  g.save(); rr(g, sx, sy, SW, SH, 52); g.clip();
  g.fillStyle = lin(g, 0, 0, PW, PH * 0.6, [[0, 'rgba(255,255,255,0.10)'], [0.45, 'rgba(255,255,255,0.02)'], [0.46, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']]);
  g.fillRect(0, 0, PW, PH); g.restore();
}
/* 휴대폰을 장면에 놓는다. o: { s 크기, rot 기울기(-1..1), vx 이동 속도(px/프레임, 흐림용), alpha, shadow } */
function phone(cx, cy, screenFn, t, o = {}) {
  renderPhone(screenFn, t);
  const s = (o.s ?? 1) / PR, rot = o.rot ?? 0;
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.translate(cx, cy);
  // 회전(3D 느낌): 가로로 눌리고 한쪽이 위로 기운다
  ctx.transform(1 - Math.abs(rot) * 0.28, rot * 0.16, rot * -0.05, 1, 0, 0);
  ctx.rotate(o.tilt ?? 0);
  ctx.scale(s, s);
  // 그림자
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(-PHONE.width / 2 + 20, -PHONE.height / 2 + 20, PHONE.width - 40, PHONE.height - 40, 90); ctx.fill(); ctx.restore();
  const v = o.vx ?? 0, vy = o.vy ?? 0;
  if (Math.abs(v) + Math.abs(vy) > 2) {   // 움직임 흐림: 진행 방향으로 여러 장
    const n = 8;
    for (let i = 0; i < n; i++) { ctx.globalAlpha = (o.alpha ?? 1) * (i === n - 1 ? 1 : 0.22); ctx.drawImage(PHONE, -PHONE.width / 2 - (v * (n - 1 - i) / n) / s, -PHONE.height / 2 - (vy * (n - 1 - i) / n) / s); }
  } else ctx.drawImage(PHONE, -PHONE.width / 2, -PHONE.height / 2);
  ctx.restore();
}
// 떠 있는 카드 (흰 둥근 상자)
function card(x, y, w, h, k, fn, o = {}) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(k * 2) * (o.alpha ?? 1);
  const s = 0.7 + 0.3 * eOutBack(clamp(k));
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.rotate(o.rot ?? 0);
  if (k < 0.6) ctx.filter = `blur(${((0.6 - k) * 20).toFixed(1)}px)`;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  ctx.fillStyle = o.fill ?? '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, o.r ?? 26); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, o.r ?? 26); ctx.clip();
  ctx.translate(-w / 2, -h / 2);
  fn(ctx, w, h);
  ctx.restore();
}
// 장면 사이 덜컥 움직임 속도(흐림용)
const vel = (f, t) => (f(t) - f(t - 1 / FPS));

/* ---------- 9. 전환 ---------- */
// 밝은 빛줄기가 훑고 지나간다 (실내 사진 장면 들어갈 때)
function lightSweep(t, at) {
  const k = prog(t, at - 0.35, at + 0.35);
  if (k <= 0 || k >= 1) return;
  const x = lerp(W * 1.1, -W * 0.1, eInOutCubic(k));
  const a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(0.5, `rgba(255,246,210,${0.85 * a})`); g.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// 하얗게 번지는 섬광 (리뷰 장면 들어갈 때)
function whiteBloom(t, at) {
  const a = 1 - clamp(Math.abs(t - at) / 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = eOutCubic(a) * 0.92; ctx.fillStyle = '#f4f1ff'; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function goldFlash(t, at) {   // 도장이 찍히는 순간 금빛 번쩍
  const a = 1 - clamp(Math.abs(t - at - 0.04) / 0.16);
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = eOutCubic(a) * 0.22; ctx.fillStyle = '#ffe070'; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function whip(t, at) {   // 짧은 가로 흐림 (휙)
  const a = 1 - clamp(Math.abs(t - at) / 0.12);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.35 * a; ctx.filter = `blur(${(14 * a).toFixed(1)}px)`; ctx.drawImage(cv, 40 * a, 0); ctx.restore();
}

/* ---------- 10. 한 프레임 ---------- */
function render(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  for (const [[a, b], fn] of SCENES) if (t >= a && t < b) { fn(t - a, t, b - a); break; }
  [T.seal[0], T.tilt[0], T.sauce[0], T.menu[0], T.montage[0], T.map[0]].forEach(at => whip(t, at));
  goldFlash(t, T.seal[0] + 0.6);
  lightSweep(t, T.store[0]);
  whiteBloom(t, T.reviews[0]);
  if (t < 0.5) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.5})`; ctx.fillRect(0, 0, W, H); }
  vignette(0.5);
  grain(t, 0.04);
}

/* ---------- 11. 재생 / 렌더 훅 ---------- */
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
if (RENDER) document.body.classList.add('render');
else cv.style.aspectRatio = `${W} / ${H}`;
window.DURATION = DUR;
window.FPS = FPS;
window.renderFrame = t => render(t);
window.captureFrame = t => { render(t); return cv.toDataURL('image/png'); };

async function boot() {
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 40px Pre`, '가A')).concat([document.fonts.load('400 40px Mono', 'A'), document.fonts.load('900 40px NotoKR', '가')]));
  buildNoise();
  await loadPhotos();
  window.sceneReady = true;
  if (RENDER) { render(Number(params.get('t') || 0)); return; }
  const snd = document.getElementById('snd'), seek = document.getElementById('seek'), btn = document.getElementById('play'), lab = document.getElementById('time');
  seek.max = DUR;
  let playing = false, tAt = Number(params.get('t') || 0), t0 = performance.now();
  render(tAt);
  btn.onclick = () => { playing = !playing; btn.textContent = playing ? '일시정지' : '재생'; t0 = performance.now(); if (playing) { snd.currentTime = tAt; snd.play().catch(() => {}); } else snd.pause(); };
  seek.oninput = () => { tAt = Number(seek.value); snd.currentTime = tAt; render(tAt); lab.textContent = tAt.toFixed(2) + 's'; };
  (function loop(now) {
    if (playing) { tAt = snd.duration && !snd.paused ? snd.currentTime : tAt + (now - t0) / 1000; if (tAt >= DUR) { tAt = 0; snd.currentTime = 0; } render(tAt); seek.value = tAt; lab.textContent = tAt.toFixed(2) + 's'; }
    t0 = now; requestAnimationFrame(loop);
  })(performance.now());
}
boot();
