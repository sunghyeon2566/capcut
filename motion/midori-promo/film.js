/* ============================================================
   緣 미도리 홍보 모션 — 레퍼런스(앱 런칭 필름)의 문법, 원래의 초록 조명 그대로 (미도리 = 초록).
   리뷰를 중심에: 리뷰 키워드, 리뷰 카드, 리뷰 타자. 사진·간판은 받은 실사 이미지(assets/),
   지도는 받은 지도를 보고 다시 그린 약도. window.ORIENT = 'h'(16:9) | 'v'(9:16).
   모든 프레임은 시간 t 만으로 결정된다.
   ============================================================ */

/* ---------- 1. 설정 (16:9 와 9:16 이 같은 타임라인을 쓴다) ---------- */
const V = window.ORIENT === 'v';                   // 세로(9:16) 버전
const W = V ? 1080 : 1920, H = V ? 1920 : 1080, FPS = 30, DUR = 55.0;
const o = (h, v) => (V ? v : h);                   // 가로 값, 세로 값
const BPM = 120, BEAT = 60 / BPM;
const T = {
  hook:    [0, 3.0],     // 명동 골목 안, 40년 일식집 → 휴대폰 (회 사진)
  scan:    [3.0, 5.5],   // 사진 속으로 — 리뷰 키워드
  since:   [5.5, 8.5],   // 1986 카운터 (골목 간판 사진)
  tilt:    [8.5, 11.0],  // 숙성 회, 쫄깃하게 (리뷰 카드)
  hoe:     [11.0, 14.0], // 회덮밥, 양도 푸짐 (키워드 배지)
  menu:    [14.0, 19.5], // 메뉴판 열 가지 → 한 상 + 도시락정식
  reviews: [19.5, 28.0], // (보라) 리뷰 타자 + 리뷰 카드 두 장
  gather:  [28.0, 32.0], // (청록) 모임도, 혼밥도 — 칸막이 방
  montage: [32.0, 37.5], // 화면 다섯 개
  store:   [37.5, 42.0], // 골목 안 초록 간판
  map:     [42.0, 49.0], // 약도 + 주소
  end:     [49.0, DUR],  // 緣 미도리 + 꼭 예약하고 가셔요
};

const C = {
  bg: '#040a07',
  ember: '#0f3b28',   // 기본 빛: 초록 (미도리 = 초록)
  teal: '#0e3b44',
  plum: '#2b1a4a',
  acc: '#5BE3A1',     // 민트 초록
  acc2: '#2BD38A',
  fg: '#F4F7F5',
  muted: 'rgba(244,247,245,0.6)',
  ui: '#ffffff', uiInk: '#121614', uiMuted: '#7f8a85', uiChip: '#eef3f0', uiBtn: '#1E9E62',
};

// 화면 문구 — 사용자가 준 사진·리뷰·메뉴판·지도·매장 정보에서만
const COPY = {
  brandH: '緣', brand: '미도리',
  tag: 'SINCE 1986 · MYEONGDONG · 日食',
  addr1: '서울 중구', addr2: '퇴계로22길 7',
  exit: '명동역 2번 출구에서 67m',
  tel: '02-776-5560',
  menu: [['생선회정식', '刺身定食'], ['도시락정식', '우동 포함'], ['생선초밥', 'あゆずし'], ['회덮밥', '刺身のどんぶり'], ['대구탕', 'タラの鍋'],
         ['알탕', '魚の卵スープ'], ['생선구이', 'やきざかな'], ['새우정식', 'エビ'], ['장어정식', 'うなぎ'], ['전복죽', 'アワビ粥']],
  r1: '40년째 운영중인 미도리 일식스시집인데 도시락정식이 정말 알찼습니다. 튀김은 갓튀겨내서 따뜻했고 생선회는 숙성이 잘되서 쫄깃거렸어요',
  r1b: '많은분들이 줄서서 먹는데 미리 예약하고 가서 행복하게 먹었습니다. 꼭 예약하고 가셔요!',
  r2: '혼자 회덮밥 먹음! 신선한 야채 좋았고 회 양이 푸짐했다. 모임하기도 좋은 공간! 칸막이 방도 따로 있었다! 골목 안쪽에 있어서 비밀공간 같은 느낌도 ㅎㅎ 1986년부터 운영했다는 푯말도 있다!',
  r2a: '“골목 안쪽에 있어서', r2b: '비밀공간 같은 느낌”',
  r3: '회덮밥 최고~~ 양도 많고 맛도 좋아요 반찬도 모두 맛있어요~ 식사 끝나면 입가심 할 과일도 한입 후식으로 주세요~~',
  r5: '미도리 토요일 영업합니다. 회무침은 서비스~ 쭈꾸미 보들보들',
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
  // 리뷰 장면은 보라, 모임 장면은 청록, 나머지는 초록
  const toPlum = sstep(T.reviews[0] - 0.4, T.reviews[0] + 0.3, t) * (1 - sstep(T.gather[0] - 0.4, T.gather[0] + 0.3, t));
  const toTeal = sstep(T.gather[0] - 0.4, T.gather[0] + 0.3, t) * (1 - sstep(T.montage[0] - 0.4, T.montage[0] + 0.3, t));
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const E = p(C.ember), Pl = p(C.plum), Te = p(C.teal);
  return E.map((v, i) => Math.round(v + (Pl[i] - v) * toPlum + (Te[i] - v) * toTeal));
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
  rr(g, x, y, w, 28, 14); g.fillStyle = on ? '#fde9d6' : C.uiChip; g.fill();
  text(label, x + 12, y + 19, { weight: 600, size: 13, color: on ? '#b5541a' : '#6e5a48' }, g);
  return w;
}
function lines(g, x, y, w, n, gap = 16, col = '#e9e4de') { g.fillStyle = col; for (let i = 0; i < n; i++) { rr(g, x, y + i * gap, w * (i === n - 1 ? 0.6 : 1 - hash(i + x) * 0.15), 7, 3.5); g.fill(); } }
function cover(g, img, x, y, w, h, zoom = 1, px, py) {
  px = px ?? img.fx ?? 0.5; py = py ?? img.fy ?? 0.5;
  const s = Math.max(w / img.width, h / img.height) * zoom, dw = img.width * s, dh = img.height * s;
  g.drawImage(img, x + (w - dw) * px, y + (h - dh) * py, dw, dh);
}

// 매장 실사 사진 — [이름, 파일, 초점 x, 초점 y]
const CACHE = {};
const PHOTOS = [
  ['board', 'assets/board.jpg', 0.5, 0.55],   // 투명한 흰살 + 붉은 살 회, 실 같은 면 위, 소스 세 가지
  ['sushi', 'assets/sushi.jpg', 0.55, 0.6],   // 와사비가 비치는 흰살 초밥, 초생강·단무지
  ['hoe', 'assets/hoe.jpg', 0.5, 0.5],        // 채소 위 회 + 초장 + 김가루 + 참깨
  ['spread', 'assets/spread.jpg', 0.45, 0.65],// 여럿이 둘러앉은 한 상 (회 · 채소 · 곁들임)
  ['store', 'assets/store.jpg', 0.5, 0.3],    // 골목 안 초록 간판 (緣 미도리 →)
  ['veg', 'assets/veg.jpg', 0.5, 0.5],        // 곁들임 채소
  ['sauce', 'assets/sauce.jpg', 0.5, 0.5],    // 소스 세 가지
];
function loadImage(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
async function loadPhotos() {
  await Promise.all(PHOTOS.map(async ([k, src, fx, fy]) => { const im = await loadImage(src); if (im) { im.fx = fx; im.fy = fy; CACHE[k] = im; } }));
}
const KJ = 'Pre, NotoKR';   // 한자·일본어가 섞인 글

/* ---------- 휴대폰 화면 ---------- */
function scrHero(g, t) {
  cover(g, CACHE.board, 0, 0, SW, SH, 1.06 + 0.01 * t);
  g.fillStyle = lin(g, 0, 0, 0, 120, [[0, 'rgba(0,0,0,0.5)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 0, SW, 120);
  statusBar(g, true);
  rr(g, SW / 2 - 78, 60, 156, 32, 16); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
  text('緣 미도리 · 日食', SW / 2, 81, { fam: KJ, weight: 700, size: 13, align: 'center', color: '#fff' }, g);
  g.fillStyle = lin(g, 0, SH - 160, 0, SH, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]); g.fillRect(0, SH - 160, SW, 160);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(SW / 2, SH - 78, 30, 0, TAU); g.stroke();
  g.fillStyle = C.uiBtn; g.beginPath(); g.arc(SW / 2, SH - 78, 23, 0, TAU); g.fill();
}
function scrDish(g, t, img, title, sub, chips, btnLabel, o2 = {}) {
  g.fillStyle = C.ui; g.fillRect(0, 0, SW, SH);
  cover(g, img, 0, 0, SW, 430, 1.0 + (o2.zoom || 0));
  statusBar(g, true);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(34, 78, 16, 0, TAU); g.fill();
  g.strokeStyle = '#111'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(38, 71); g.lineTo(31, 78); g.lineTo(38, 85); g.stroke();
  rr(g, 0, 410, SW, SH - 410, 26); g.fillStyle = C.ui; g.fill();
  g.fillStyle = '#d5ddd9'; rr(g, SW / 2 - 20, 420, 40, 5, 2.5); g.fill();
  text(title, 26, 470, { fam: KJ, weight: 800, size: 27, ls: -0.5, color: C.uiInk }, g);
  text(sub, 26, 498, { fam: KJ, weight: 500, size: 14, color: C.uiMuted }, g);
  let cx = 26; chips.forEach((c, i) => { cx += chip(g, cx, 520, c, i === 0) + 8; });
  lines(g, 26, 578, SW - 52, 3, 16, '#e4ebe7');
  rr(g, 26, 640, SW - 52, 86, 18); g.fillStyle = '#f2f7f4'; g.fill();
  text(o2.boxTitle || '방문 리뷰', 44, 670, { weight: 700, size: 14, color: C.uiInk }, g);
  text(o2.boxSub || '재료가 신선해요', 44, 697, { fam: KJ, weight: 500, size: 13, color: C.uiMuted }, g);
  btn(g, 26, SH - 92, SW - 52, 54, btnLabel);
}
const MENU_IMG = { '생선회정식': 'board', '생선초밥': 'sushi', '회덮밥': 'hoe' };
function scrMenu(g, t, scroll = 0) {
  g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, SW, SH);
  g.save(); g.beginPath(); g.rect(0, 168, SW, SH - 168); g.clip();
  COPY.menu.forEach(([name, sub], i) => {
    const y = 176 + i * 96 - scroll;
    if (y < 100 || y > SH) return;
    rr(g, 20, y, SW - 40, 84, 18); g.fillStyle = '#fff'; g.fill();
    g.save(); rr(g, 30, y + 10, 64, 64, 14); g.clip();
    const im = CACHE[MENU_IMG[name]];
    if (im) cover(g, im, 30, y + 10, 64, 64, 1.3);
    else { g.fillStyle = lin(g, 30, y + 10, 94, y + 74, [[0, '#2f8a63'], [1, '#14382a']]); g.fillRect(30, y + 10, 64, 64); text(name[0], 62, y + 54, { weight: 800, size: 26, align: 'center', color: '#fff' }, g); }
    g.restore();
    text(name, 110, y + 38, { weight: 800, size: 18, color: C.uiInk }, g);
    text(sub, 110, y + 62, { fam: KJ, weight: 500, size: 13, color: C.uiMuted }, g);
  });
  g.restore();
  g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, SW, 168);
  statusBar(g);
  text('메뉴', 26, 102, { weight: 800, size: 30, color: C.uiInk }, g);
  rr(g, SW - 120, 82, 94, 28, 14); g.fillStyle = '#e1f5ea'; g.fill();
  text('메뉴판 그대로', SW - 73, 101, { weight: 700, size: 12, align: 'center', color: '#1E7A4E' }, g);
  let cx = 26; ['전체', '정식', '초밥·회', '탕·죽'].forEach((c, i) => { cx += chip(g, cx, 126, c, i === 0) + 8; });
}
function scrReview(g, t, typed, kOn = 1, full = '') {
  g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  text('리뷰', 26, 100, { weight: 800, size: 30, color: C.uiInk }, g);
  text('미도리, 어떠셨나요?', 26, 126, { weight: 500, size: 14, color: C.uiMuted }, g);
  let cx = 26;
  [['😋 음식이 맛있어요', 0.0], ['🌿 재료가 신선해요', 0.4]].forEach(([c, at]) => { cx += chip(g, cx, 146, c, kOn > at) + 8; });
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
  g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, SW, SH);
  statusBar(g);
  text('방문자 리뷰', 26, 102, { weight: 800, size: 28, color: C.uiInk }, g);
  [[COPY.r1, '점심 방문 · 예약 후 이용'], [COPY.r2, '저녁 방문 · 혼자'], [COPY.r3, '점심 방문']].forEach(([r, meta], i) => {
    const y = 128 + i * 228;
    rr(g, 20, y, SW - 40, 212, 20); g.fillStyle = '#fff'; g.fill();
    g.fillStyle = ['#bfe8d2', '#c9d8f3', '#f3dcc0'][i]; g.beginPath(); g.arc(50, y + 34, 16, 0, TAU); g.fill();
    text(meta, 76, y + 40, { weight: 600, size: 13, color: C.uiMuted }, g);
    const words = r.split(' '); let line = '', yy = y + 76, n = 0;
    for (const w of words) { const tr = line ? line + ' ' + w : w; if (measure(tr, { weight: 500, size: 15 }, g) > SW - 84 && line) { text(line, 36, yy, { weight: 500, size: 15, color: C.uiInk }, g); yy += 24; line = w; if (++n >= 5) { line = ''; break; } } else line = tr; }
    if (line) text(line, 36, yy, { weight: 500, size: 15, color: C.uiInk }, g);
  });
}

/* ---------- 카드·글 도구 ---------- */
function quoteCard(g, w, h, quote, meta, tag, size = 22) {
  g.fillStyle = '#e1f5ea'; g.beginPath(); g.arc(44, 42, 18, 0, TAU); g.fill();
  text('“', 44, 58, { weight: 800, size: 34, align: 'center', color: C.uiBtn }, g);
  text(meta, 74, 48, { weight: 600, size: 15, color: C.uiMuted }, g);
  const words = quote.split(' '); let line = '', yy = 92 + size * 0.3;
  words.forEach(wd => { const tr = line ? line + ' ' + wd : wd; if (measure(tr, { weight: 700, size }, g) > w - 64 && line) { text(line, 30, yy, { weight: 700, size, color: C.uiInk }, g); yy += size * 1.45; line = wd; } else line = tr; });
  text(line, 30, yy, { weight: 700, size, color: C.uiInk }, g);
  if (tag) { const tw = measure(tag, { weight: 700, size: 15 }, g) + 30; rr(g, 30, h - 52, tw, 32, 16); g.fillStyle = '#e1f5ea'; g.fill(); text(tag, 45, h - 30, { weight: 700, size: 15, color: '#1E7A4E' }, g); }
}
function pillCard(x, y, label, k, o2 = {}) {   // 둥근 배지 하나
  if (k <= 0) return;
  const size = o2.size ?? 26, tw = measure(label, { weight: 800, size }) + 56, hh = size * 2.3;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * (o2.alpha ?? 1);
  const s = 0.6 + 0.4 * eOutBack(clamp(k));
  ctx.translate(x + (o2.center ? 0 : tw / 2), y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = o2.fill ?? '#fff'; ctx.beginPath(); ctx.roundRect(-tw / 2, -hh / 2, tw, hh, hh / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  text(label, 0, size * 0.36, { fam: KJ, weight: 800, size, align: 'center', color: o2.color ?? '#1E7A4E' });
  ctx.restore();
}
// 왼쪽(가로) / 위쪽(세로) 글 묶음 자리
const TXT = { x: o(120, 80), eb: o(438, 230), hd: o(530, 330), hdS: o(84, 84) };
const subY = (lines2, size = TXT.hdS) => TXT.hd + (lines2 - 1) * size * 1.1 + o(70, 66);
// 휴대폰 기본 자리
const PHX = o(W * 0.72, W / 2), PHY = o(H / 2 + 10, H * 0.64), PHS = o(0.95, 1.0);

/* ============================================================
   8. 장면
   ============================================================ */
// ① 명동 골목 안, 40년 일식집 → 휴대폰
function sHook(lt, t) {
  background(t, W * 0.6, H * 0.45, 0.9 + 0.1 * Math.sin(t * 2));
  const enter = eInOutQuint(prog(lt, 1.15, 2.1));
  const lines2 = [[['명동 골목 안,', C.fg]], [['40년 일식집.', C.acc]]];
  const sz = lerp(o(86, 92), o(74, 84), enter);
  if (!V) {   // 가로: 한 줄로 가운데 → 왼쪽으로 (왼쪽 끝을 이어서 움직여 튀지 않게)
    const one = [[['명동 골목 안, ', C.fg], ['40년 일식집.', C.acc]]];
    const tw = measure('명동 골목 안, 40년 일식집.', { ...HEAD, size: sz });
    blurHead(one, lerp(W / 2 - tw / 2, 150, enter), H / 2 + 34, lt, 0.25, { size: sz });
  } else {
    const tw = measure('40년 일식집.', { ...HEAD, size: sz });
    blurHead(lines2, lerp(W / 2 - tw / 2, TXT.x, enter), lerp(H * 0.44, TXT.hd, enter), lt, 0.25, { size: sz });
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
// ② 회 사진 속으로 — 리뷰 키워드
function sScan(lt, t, d) {
  const z = 1.0 + 0.05 * lt;
  const R0 = o({ x: W * 0.4, y: 0, w: W * 0.6, h: H }, { x: 0, y: H * 0.36, w: W, h: H * 0.64 });
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  cover(ctx, CACHE.board, R0.x, R0.y, R0.w, R0.h, z, 0.5, 0.55);
  const gl = V ? ctx.createLinearGradient(0, R0.y, 0, R0.y + 300) : ctx.createLinearGradient(R0.x, 0, R0.x + 300, 0);
  gl.addColorStop(0, 'rgba(4,10,7,1)'); gl.addColorStop(1, 'rgba(4,10,7,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
  const out = 1 - sstep(d - 0.3, d, lt);
  const k = prog(lt, 0.2, 1.4), cx = R0.x + R0.w * 0.5, cy = R0.y + R0.h * 0.52, R = 74;
  ctx.save(); ctx.globalAlpha = clamp(lt * 3) * out;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = C.acc; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * eOutCubic(k)); ctx.stroke();
  text(`${Math.round(eOutCubic(k) * 100)}%`, cx, cy + 11, { weight: 700, size: 30, align: 'center', color: '#fff' });
  text(k < 1 ? '리뷰 키워드 찾는 중...' : '리뷰 키워드', cx, cy + R + 48, { weight: 700, size: 23, align: 'center', color: '#fff', shadow: 'rgba(0,0,0,0.85)' });
  ctx.restore();
  [['신선해요', -0.95, -0.55, 0.9], ['쫄깃', 0.95, -0.45, 1.1], ['푸짐', -1.0, 0.55, 1.3], ['보들보들', 0.95, 0.6, 1.5]].forEach(([w, dx, dy, at]) =>
    pillCard(cx + dx * o(240, 270), cy + dy * o(230, 300), w, prog(lt, at, at + 0.35), { center: true, size: 30, color: '#1E7A4E', alpha: out }));
  eyebrow('REVIEW SCAN', TXT.x, TXT.eb, lt, 0.2, d - 0.35);
  blurHead([[['리뷰가 말하는', C.fg]], [['그 맛.', C.acc]]], TXT.x - 2, TXT.hd, lt, 0.3, { size: TXT.hdS, out: d - 0.35 });
  subline('방문 리뷰에 적힌 말 그대로', TXT.x + 2, subY(2), lt, 0.9, d - 0.35);
}
// ③ 1986년부터, 40년
function sSince(lt, t, d) {
  background(t, o(W * 0.7, W * 0.5), o(H * 0.45, H * 0.7));
  const inK = eOutExpo(prog(lt, 0, 0.55));
  const scr = (g, tt) => scrDish(g, tt, CACHE.store, '緣 미도리', '명동 골목 안 일식집', ['SINCE 1986', '명동', '日食'], '메뉴 보기', { boxTitle: '방문 리뷰', boxSub: '“40년째 운영중인 일식스시집”' });
  if (!V) phone(lerp(W * 0.86, PHX, inK), PHY, scr, t, { s: PHS, alpha: clamp(lt * 4) });
  else phone(PHX, lerp(H + 400, PHY + 120, inK), scr, t, { s: PHS * 0.9, alpha: clamp(lt * 4) });
  const k = eOutCubic(prog(lt, 0.15, 1.3)), n = Math.round(lerp(1946, 1986, k));
  const nx = o(140, TXT.x), ny = o(470, 450);
  ctx.save(); ctx.globalAlpha = clamp(lt * 4) * (1 - sstep(d - 0.3, d, lt));
  text('SINCE', nx + 6, ny - o(170, 175), { fam: 'Mono', weight: 400, size: 24, ls: 8, color: C.acc });
  if (k < 0.95) ctx.filter = `blur(${((0.95 - k) * 9).toFixed(1)}px)`;
  text(String(n), nx, ny, { weight: 800, size: o(190, 200), ls: -6, color: C.fg });
  ctx.restore();
  blurHead([[['1986년부터, ', C.fg], ['40년.', C.acc]]], nx + 2, ny + o(96, 100), lt, 0.8, { size: o(58, 60), out: d - 0.35 });
  subline('“1986년부터 운영했다는 푯말도 있다!” — 방문 리뷰', nx + 4, ny + o(150, 156), lt, 1.2, d - 0.35, { size: o(27, 26) });
  const ck = prog(lt, 1.4, 2.0);
  const cw = 560, cx2 = o(lerp(PHX - 120, W * 0.4, eOutCubic(ck)) - cw / 2, W / 2 - cw / 2), cy2 = o(680, 700);
  card(cx2, cy2, cw, 108, ck * (1 - sstep(d - 0.25, d, lt)), (g, w, h) => {
    text('메뉴판에서', 26, 36, { weight: 700, size: 15, color: C.uiMuted }, g);
    let x = 26; ['생선회', '초밥', '회덮밥', '도시락'].forEach((c, i) => { const w2 = measure(c, { weight: 800, size: 19 }, g) + 30; rr(g, x, 52, w2, 38, 19); g.fillStyle = ['#e1f5ea', '#e6f3ee', '#eaf6e3', '#f3f0e1'][i]; g.fill(); text(c, x + 15, 78, { weight: 800, size: 19, color: ['#1E7A4E', '#2c6e57', '#3f7a2e', '#7a6a1a'][i] }, g); x += w2 + 10; });
  });
}
// ④ 숙성 회, 쫄깃하게 (기울어진 화면 + 리뷰 카드)
function sTilt(lt, t, d) {
  background(t, o(W * 0.35, W * 0.5), o(H * 0.5, H * 0.7));
  const tk = eOutCubic(prog(lt, 0, 0.5)), out = d - 0.35;
  const scr = (g, tt) => scrDish(g, tt, CACHE.board, '생선회', '투명하게 썬 흰살 · 붉은 살', ['숙성', '쫄깃', '와사비'], '메뉴 보기', { zoom: 0.05 * lt, boxTitle: '방문 리뷰', boxSub: '“숙성이 잘되서 쫄깃거렸어요”' });
  if (!V) phone(lerp(W * 0.6, W * 0.34, tk), H / 2 + 20, scr, t, { s: 0.92, rot: lerp(0, -0.7, tk), tilt: lerp(0, -0.12, tk), vx: lt < 0.4 ? -30 * (1 - tk) : 0 });
  else phone(lerp(W * 0.5, W * 0.6, tk), H * 0.7, scr, t, { s: 0.92, rot: lerp(0, -0.6, tk), tilt: lerp(0, -0.1, tk) });
  const hx = o(W * 0.53, TXT.x), hy = o(400, TXT.hd);
  blurHead([[['숙성 회,', C.fg]], [['쫄깃하게.', C.acc]]], hx, hy, lt, 0.25, { size: o(82, 86), out });
  const ck = prog(lt, 0.9, 1.4);
  card(o(W * 0.53, TXT.x - 10), o(520, 560), o(760, 940), 160, ck * (1 - sstep(out, d, lt)), (g, w, h) => quoteCard(g, w, h, '생선회는 숙성이 잘되서 쫄깃거렸어요', '방문 리뷰 · 점심 · 예약 후 이용', null, 34));
}
// ⑤ 회덮밥, 양도 푸짐 (키워드 배지)
function sHoe(lt, t, d) {
  background(t, o(W * 0.68, W * 0.5), o(H * 0.45, H * 0.7));
  const k = eOutCubic(prog(lt, 0, 0.5)), out = d - 0.35;
  const scr = (g, tt) => scrDish(g, tt, CACHE.hoe, '신선한 야채와 회', '초장 · 김가루 · 참깨', ['신선', '푸짐', '새콤'], '메뉴 보기', { zoom: 0.04 * lt, boxTitle: '리뷰 키워드', boxSub: '재료가 신선해요 · 음식이 맛있어요' });
  if (!V) phone(lerp(W * 0.38, W * 0.72, k), H / 2 + 14, scr, t, { s: 0.95, rot: lerp(-0.7, 0, k), tilt: lerp(-0.12, 0, k) });
  else phone(lerp(W * 0.62, W / 2, k), PHY + 40, scr, t, { s: PHS * 0.95, rot: lerp(-0.6, 0, k), tilt: lerp(-0.1, 0, k) });
  eyebrow('REVIEW KEYWORD', TXT.x + o(20, 0), o(380, TXT.eb), lt, 0.2, out);
  blurHead([[['회덮밥,', C.fg]], [['양도 푸짐.', C.acc]]], TXT.x + o(20, 0), o(470, TXT.hd), lt, 0.35, { size: o(90, 88), out });
  subline('“신선한 야채 좋았고 회 양이 푸짐했다” — 방문 리뷰', TXT.x + o(24, 2), o(630, subY(2, 88)), lt, 1.0, out, { size: o(27, 25) });
  const by = o(700, subY(2, 88) + 62);
  pillCard(TXT.x + o(20, 0), by, '😋 음식이 맛있어요', prog(lt, 1.3, 1.8) * (1 - prog(lt, out, d)), { size: 22 });
  pillCard(TXT.x + o(20, 0) + o(330, 330), by, '🌿 재료가 신선해요', prog(lt, 1.5, 2.0) * (1 - prog(lt, out, d)), { size: 22 });
}
// ⑥ 메뉴판 열 가지 → 한 상 + 도시락정식
function sMenu(lt, t, d) {
  background(t, o(W * 0.35, W * 0.5), o(H * 0.45, H * 0.6));
  const whipIn = (x) => o(lerp(-500, W * 0.3, eOutExpo(prog(x, 0, 0.55))), lerp(-600, W / 2, eOutExpo(prog(x, 0, 0.55))));
  const detail = sstep(2.6, 3.1, lt), zoomK = eInOutCubic(prog(lt, 2.7, 3.3));
  const scroll = 420 * eInOutCubic(prog(lt, 0.9, 2.5));
  const scr = (g, tt) => {
    scrMenu(g, tt, scroll);
    if (detail > 0) { g.save(); g.globalAlpha = detail; scrDish(g, tt, CACHE.spread, '한 상 차림', '회 · 채소 · 곁들임 · 소스', ['생선회', '채소', '곁들임'], '함께 주문하기', { boxTitle: '방문 리뷰', boxSub: '“반찬도 모두 맛있어요”' }); g.restore(); }
  };
  if (!V) phone(whipIn(lt) + zoomK * 40, H / 2 + 10 + zoomK * 40, scr, t, { s: 0.95 + zoomK * 0.1, vx: vel(whipIn, lt) });
  else phone(whipIn(lt), PHY + 60 + zoomK * 40, scr, t, { s: PHS * 0.95, vx: vel(whipIn, lt) });
  const hx = o(W * 0.53, TXT.x), out1 = 2.4;
  eyebrow('MENU', hx, o(400, TXT.eb), lt, 0.35, out1);
  blurHead([[['생선회정식부터', C.fg]], [['전복죽까지.', C.acc]]], hx, o(490, TXT.hd), lt, 0.4, { size: o(80, 80), out: out1 });
  subline('메뉴판 그대로 · 열 가지 메뉴', hx + 3, o(640, subY(2, 80)), lt, 0.9, out1);
  // 상세: 채소 카드 + 리뷰 한 줄
  const ck = prog(lt, 3.2, 3.8);
  const vc = o({ x: W * 0.48, y: 200, w: 760, h: 452 }, { x: 60, y: 160, w: 560, h: 333 });
  card(vc.x, vc.y, vc.w, vc.h, ck * (1 - sstep(d - 0.3, d, lt)), (g, w, h) => {
    cover(g, CACHE.veg, 0, 0, w, h, 1.0, 0.5, 0.5);
    g.fillStyle = lin(g, 0, h * 0.55, 0, h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]); g.fillRect(0, 0, w, h);
    text('곁들임 채소', 24, h - 22, { weight: 700, size: 20, color: '#fff' }, g);
  }, { r: 24 });
  const ck2 = prog(lt, 3.8, 4.3);
  const qc = o({ x: W * 0.5, y: 690, w: 820, h: 190 }, { x: 330, y: 470, w: 690, h: 200 });
  card(qc.x, qc.y, qc.w, qc.h, ck2 * (1 - sstep(d - 0.3, d, lt)), (g, w, h) => quoteCard(g, w, h, '도시락정식이 정말 알찼습니다. 튀김은 갓튀겨내서 따뜻했고', '방문 리뷰 · 점심', null, 26));
}
// ⑦ (보라) 리뷰 — 타자 + 카드 두 장
function sReviews(lt, t, d) {
  background(t, o(W * 0.72, W * 0.5), o(H * 0.45, H * 0.7));
  const k = eOutExpo(prog(lt, 0.05, 0.6));
  const typed = COPY.r2.slice(0, Math.floor(clamp((lt - 0.6) * 28, 0, COPY.r2.length)));
  const shrink = eInOutCubic(prog(lt, 4.0, 4.7));
  const scr = (g, tt) => scrReview(g, tt, typed, prog(lt, 1.0, 3.0), COPY.r2);
  if (!V) phone(lerp(W * 0.95, W * 0.74, k), H / 2 + 14, scr, t, { s: 0.98 });
  else phone(W / 2, lerp(H + 500, PHY + 60, k) + eInCubic(prog(lt, 4.0, 4.7)) * 1100, scr, t, { s: PHS * 0.95 });
  eyebrow('REVIEWS', TXT.x, lerp(o(410, TXT.eb), o(168, 150), shrink), lt, 0.3);
  const sz = lerp(o(76, 70), 34, shrink), x0 = TXT.x - 2, y0 = lerp(o(510, TXT.hd), o(236, 216), shrink);
  const l1 = COPY.r2a, l2 = COPY.r2b, n = Math.floor(clamp((lt - 0.6) * 9, 0, l1.length + l2.length));
  const s1 = l1.slice(0, Math.min(n, l1.length)), s2 = n > l1.length ? l2.slice(0, n - l1.length) : '';
  text(s1, x0, y0, { ...HEAD, size: sz });
  text(s2, x0, y0 + sz * 1.12, { ...HEAD, size: sz, color: C.acc });
  if (n < l1.length + l2.length && Math.floor(lt * 2.5) % 2 === 0) { ctx.fillStyle = C.acc; ctx.fillRect(x0 + measure(n > l1.length ? s2 : s1, { ...HEAD, size: sz }) + 8, y0 + (n > l1.length ? sz * 1.12 : 0) - sz * 0.8, 4, sz * 0.9); }
  subline('방문 리뷰 · 저녁 방문 · 혼자', x0 + 4, y0 + sz * 1.12 + 60 * (1 - shrink) + 40, lt, 2.6);
  const c1 = o({ x: W * 0.2, y: 320, w: 680, h: 250 }, { x: 70, y: 380, w: 940, h: 250 });
  const c2 = o({ x: W * 0.27, y: 560, w: 640, h: 210 }, { x: 110, y: 690, w: 900, h: 240 });
  card(c1.x, c1.y, c1.w, c1.h, prog(lt, 4.7, 5.3), (g, w, h) => quoteCard(g, w, h, COPY.r1b, '방문 리뷰 · 점심 · 예약 후 이용', '😋 음식이 맛있어요', 24), { rot: -0.02 });
  card(c2.x, c2.y, c2.w, c2.h, prog(lt, 5.3, 5.9), (g, w, h) => quoteCard(g, w, h, COPY.r3, '방문 리뷰 · 점심', null, 22), { rot: 0.015 });
  blurHead([[['줄 서서 먹는 ', C.fg], ['리뷰 맛집.', C.acc]]], o(118, W / 2), o(880, 1120), lt, 6.1, { size: o(66, 72), align: o('left', 'center') });
}
// ⑧ (청록) 모임도, 혼밥도 — 칸막이 방
function sGather(lt, t, d) {
  background(t, o(W * 0.55, W * 0.5), o(H * 0.5, H * 0.66));
  const k = eOutExpo(prog(lt, 0.05, 0.6)), out = d - 0.35;
  const cx = o(W * 0.6, W / 2), cy = o(H / 2 + 30, PHY + 40);
  for (let i = 0; i < 3; i++) {
    if (lt < 1.0) break;
    const ph = ((lt - 1.0) * 0.6 + i / 3) % 1;
    ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8 * (1 - sstep(d - 0.3, d, lt));
    ctx.strokeStyle = 'rgba(120,230,240,0.9)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(120,230,240,0.8)'; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.ellipse(cx, cy + 180, 200 + ph * 420, 160 + ph * 330, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  phone(cx, lerp(H + 500, cy, k), (g, tt) => scrDish(g, tt, CACHE.spread, '모임 자리', '칸막이 방이 따로 (방문 리뷰)', ['모임', '혼밥', '칸막이 방'], '자리 문의', { boxTitle: '방문 리뷰', boxSub: '“모임하기도 좋은 공간!”' }), t, { s: o(1.0, PHS), vy: lt < 0.6 ? -40 * (1 - k) : 0 });
  eyebrow('GATHERING', TXT.x, TXT.eb, lt, 0.3, out);
  blurHead([[['모임도,', C.fg]], [['혼밥도.', C.acc]]], TXT.x - 2, TXT.hd, lt, 0.4, { size: TXT.hdS + 4, out });
  subline('“칸막이 방도 따로 있었다!” — 방문 리뷰', TXT.x + 2, subY(2, TXT.hdS + 4), lt, 0.9, out);
  [['+ 칸막이 방', 1.3, -1], ['+ 모임', 1.8, 1], ['+ 혼자서도', 2.3, -1]].forEach(([s2, at, sd], i) => {
    const kk = prog(lt, at, at + 0.5);
    if (kk <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(kk * 2) * (1 - sstep(d - 0.3, d, lt));
    const mo = { fam: 'Mono, NotoKR', weight: 400, size: o(30, 30) };
    const lx = cx + sd * o(330, 300) + (sd < 0 ? -measure(s2, mo) : 0), ly = cy + o(-40, -120) + i * o(110, 170) - eOutCubic(kk) * 30;
    text(s2, lx, ly, { ...mo, color: 'rgba(170,240,245,0.95)', shadow: 'rgba(120,230,240,0.6)' });
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
    (g, tt) => scrDish(g, tt, CACHE.sushi, '생선초밥', '와사비가 비치는 흰살 초밥', ['초밥', '초생강', '와사비'], '메뉴 보기'),
    (g, tt) => scrDish(g, tt, CACHE.hoe, '신선한 야채와 회', '초장 · 김가루 · 참깨', ['신선', '푸짐', '새콤'], '메뉴 보기'),
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
  if (lt < swap + 0.2) blurHead([[['신선. ', C.fg], ['쫄깃. ', C.fg], ['푸짐.', C.acc]]], W / 2, ty, lt, 0.4, { size: o(72, 76), align: 'center', out: swap - 0.3 });
  if (lt > swap - 0.1) {
    if (!V) blurHead([[['명동 골목 일식 ', C.fg], ['미도리.', C.acc]]], W / 2, ty, lt, swap, { size: 72, align: 'center' });
    else blurHead([[['명동 골목 일식', C.fg]], [['미도리.', C.acc]]], W / 2, ty - 40, lt, swap, { size: 76, align: 'center' });
  }
  ctx.restore();
}
// ⑩ 골목 안 초록 간판
function sStore(lt, t, d) {
  background(t, o(W * 0.7, W * 0.5), o(H * 0.4, H * 0.62));
  const k = eOutExpo(prog(lt, 0.05, 0.7)), out = d - 0.35;
  const cw = o(640, 720), ch = o(860, 960), cx = o(lerp(W + 400, W * 0.7, k), W / 2), cy = o(H / 2, lerp(H + 600, H * 0.63, k));
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(lerp(0.06, 0.012, k));
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 36); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 36); ctx.clip();
  cover(ctx, CACHE.store, -cw / 2, -ch / 2, cw, ch, 1.06 + 0.04 * lt, 0.5, 0.35);
  const sx = lerp(-cw, cw, prog(lt, 1.0, 2.2));
  const gr = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); gr.addColorStop(0, 'rgba(220,255,235,0)'); gr.addColorStop(0.5, 'rgba(220,255,235,0.3)'); gr.addColorStop(1, 'rgba(220,255,235,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(-cw / 2, -ch / 2, cw, ch * 0.4);
  ctx.restore();
  eyebrow('FIND US', TXT.x, o(418, TXT.eb), lt, 0.3, out);
  blurHead([[['골목 안', C.fg]], [['초록 간판.', C.acc]]], TXT.x - 2, o(510, TXT.hd), lt, 0.4, { size: o(86, 84), out });
  subline('→ 화살표를 따라 · 日食 JAPANESE RESTAURANT', TXT.x + 2, o(668, subY(2, 84)), lt, 1.0, out, { fam: KJ, size: o(27, 24) });
}
// ⑪ 약도 + 주소 (받은 지도를 보고 다시 그린 약도)
function drawMiniMap(g, w, h, lt) {
  const sx = w / 1000, sy = h / 620;
  g.save(); g.scale(sx, sy);
  g.fillStyle = '#eef0eb'; g.fillRect(0, 0, 1000, 620);
  // 블록
  [[20, 20, 200, 150], [250, 20, 250, 150], [530, 20, 210, 150], [770, 20, 210, 150], [20, 330, 190, 270], [250, 320, 170, 280], [450, 320, 180, 110], [450, 450, 180, 150]].forEach(([x, y, w2, h2], i) => {
    g.fillStyle = i === 7 ? '#dfe7f2' : '#e4e1d8'; rr(g, x, y, w2, h2, 10); g.fill();
  });
  text('명동', 380, 110, { weight: 800, size: 30, align: 'center', color: '#9a9488' }, g);
  text('서울남산초등학교', 540, 540, { weight: 600, size: 16, align: 'center', color: '#6d7f98' }, g);
  // 남산예장공원
  g.fillStyle = '#cfe6c6'; g.beginPath(); g.moveTo(760, 300); g.lineTo(1000, 290); g.lineTo(1000, 620); g.lineTo(700, 620); g.lineTo(690, 420); g.closePath(); g.fill();
  text('남산예장공원', 870, 470, { weight: 700, size: 22, align: 'center', color: '#4f7f46' }, g);
  // 길
  g.strokeStyle = '#ffffff'; g.lineCap = 'round';
  g.lineWidth = 40; g.beginPath(); g.moveTo(0, 245); g.lineTo(1000, 245); g.stroke();   // 퇴계로
  g.lineWidth = 16; [[230, 0, 230, 620], [510, 0, 510, 245], [650, 245, 640, 620], [430, 290, 430, 620]].forEach(([a, b, c, dd]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, dd); g.stroke(); });
  g.lineWidth = 12; g.beginPath(); g.moveTo(430, 300); g.lineTo(650, 300); g.stroke();   // 골목
  // 4호선 + 명동역
  g.fillStyle = 'rgba(160,130,220,0.25)'; rr(g, 120, 205, 300, 80, 10); g.fill();
  g.strokeStyle = '#2b8fd6'; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 245); g.lineTo(1000, 245); g.stroke();
  text('4호선', 80, 232, { weight: 700, size: 16, color: '#2b8fd6' }, g);
  text('명동역', 270, 178, { weight: 800, size: 26, align: 'center', color: '#2a2a2a' }, g);
  text('퇴계로', 860, 232, { weight: 700, size: 18, color: '#8a8a8a' }, g);
  // 출구 번호
  [[1, 600, 275], [2, 420, 285], [3, 300, 290], [4, 150, 290], [7, 300, 205], [8, 420, 205], [9, 600, 215]].forEach(([nn, x, y]) => {
    const on = nn === 2;
    g.fillStyle = on ? '#FFC93C' : '#ffd95e'; g.beginPath(); g.arc(x, y, on ? 17 : 13, 0, TAU); g.fill();
    g.strokeStyle = '#8a6a00'; g.lineWidth = on ? 3 : 1.5; g.stroke();
    text(String(nn), x, y + (on ? 7 : 5), { weight: 800, size: on ? 18 : 14, align: 'center', color: '#3a2a00' }, g);
  });
  text('2번 출구', 420, 335, { weight: 800, size: 18, align: 'center', color: '#3a2a00' }, g);
  text('이마트24', 610, 330, { weight: 600, size: 16, color: '#8a8a8a' }, g);
  // 걷는 길 (점선) — 2번 출구 → 미도리
  const pk = eOutCubic(prog(lt, 1.6, 2.6));
  g.setLineDash([8, 10]); g.strokeStyle = '#1E9E62'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(430, 300); g.lineTo(430 + (540 - 430) * pk, 300 + (345 - 300) * pk); g.stroke(); g.setLineDash([]);
  if (pk > 0.6) text('67m', 485, 360, { weight: 800, size: 20, align: 'center', color: '#1E7A4E', alpha: (pk - 0.6) / 0.4 }, g);
  g.restore();
  return { pinX: 540 * sx, pinY: 345 * sy };
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
    ctx.strokeStyle = `rgba(30,158,98,${0.7 * (1 - ph)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(pinX, pinY, 20 + ph * 120, (20 + ph * 120) * 0.6, 0, 0, TAU); ctx.stroke();
  }
  if (pk > 0) {
    const drop = (1 - eOutBack(pk)) * -80;
    ctx.save(); ctx.translate(pinX, pinY + drop);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, -drop, 16, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.uiBtn; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -36, -30, -78, 0, -80); ctx.bezierCurveTo(30, -78, 30, -36, 0, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -52, 11, 0, TAU); ctx.fill();
    ctx.restore();
    const lk = prog(lt, 1.4, 1.9);
    if (lk > 0) {
      const tw = measure('緣 미도리', { fam: KJ, weight: 800, size: 24 }) + 40;
      ctx.save(); ctx.globalAlpha = lk;
      ctx.fillStyle = '#121614'; ctx.beginPath(); ctx.roundRect(pinX - tw / 2, pinY - 150, tw, 46, 23); ctx.fill();
      text('緣 미도리', pinX, pinY - 119, { fam: KJ, weight: 800, size: 24, align: 'center', color: '#fff' });
      ctx.restore();
    }
  }
  ctx.restore();
  eyebrow('LOCATION', TXT.x, o(360, TXT.eb), lt, 0.3, out);
  blurHead([[[COPY.addr1, C.fg]], [[COPY.addr2, C.acc]]], TXT.x - 2, o(452, TXT.hd), lt, 0.4, { size: o(84, 84), out });
  const ly0 = o(640, 1330);
  [[COPY.exit, 1.6, true], ['☎ ' + COPY.tel, 2.0, false], ['토요일도 영업 (방문 리뷰)', 2.4, false]].forEach(([s2, at, hi], i) => {
    const kk = prog(lt, at, at + 0.4) * (1 - prog(lt, out, out + 0.3));
    if (kk <= 0) return;
    const y = ly0 + i * 62;
    ctx.save(); ctx.globalAlpha = eOutCubic(kk);
    ctx.fillStyle = hi ? C.acc : 'rgba(244,247,245,0.4)'; ctx.beginPath(); ctx.arc(TXT.x + 10, y - 10, 6, 0, TAU); ctx.fill();
    text(s2, TXT.x + 32 + (1 - eOutCubic(kk)) * 20, y, { weight: 700, size: 34, color: hi ? C.fg : 'rgba(244,247,245,0.78)' });
    ctx.restore();
  });
}
// ⑫ 緣 미도리 + 꼭 예약하고 가셔요
function sEnd(lt, t, d) {
  background(t, W / 2, H * 0.42, 0.85);
  ctx.save(); ctx.globalAlpha = 0.3 * sstep(0, 1.2, lt); ctx.filter = 'blur(16px) brightness(0.5) saturate(1.1)';
  cover(ctx, CACHE.board, -40, -40, W + 80, H + 80, 1.05 + 0.01 * lt); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, 100, W / 2, H * 0.5, Math.max(W, H) * 0.6); vg.addColorStop(0, 'rgba(4,10,7,0.55)'); vg.addColorStop(1, 'rgba(4,10,7,0.86)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const pk = prog(lt, 0.15, 0.6);
  if (pk > 0) {
    const pw = measure('리뷰 맛집 · SINCE 1986', { weight: 800, size: 26 }) + 56;
    ctx.save(); ctx.globalAlpha = clamp(pk * 2); ctx.translate(W / 2, o(H * 0.25, H * 0.3)); ctx.scale(0.7 + 0.3 * eOutBack(pk), 0.7 + 0.3 * eOutBack(pk));
    ctx.fillStyle = C.uiBtn; ctx.beginPath(); ctx.roundRect(-pw / 2, -29, pw, 58, 29); ctx.fill();
    text('리뷰 맛집 · SINCE 1986', 0, 10, { weight: 800, size: 26, align: 'center', color: '#fff' }); ctx.restore();
  }
  const by = o(H * 0.47, H * 0.42), size = o(150, 160);
  const hz = { fam: KJ, weight: 900, size }, bz = { weight: 800, size, ls: -4 };
  const w1 = measure(COPY.brandH, hz), w2 = measure(COPY.brand, bz), gap = 30, tw = w1 + gap + w2, x0 = W / 2 - tw / 2;
  const wk = eOutCubic(prog(lt, 0.4, 1.1));
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, by - size, (tw + 40) * wk, size * 1.4); ctx.clip();
  text(COPY.brandH, x0 - (1 - wk) * 40, by, { ...hz, color: C.acc });
  text(COPY.brand, x0 + w1 + gap - (1 - wk) * 40, by, { ...bz, color: C.fg });
  ctx.restore();
  text(COPY.tag, W / 2, by + 66, { fam: 'Mono, NotoKR', weight: 400, size: o(22, 22), ls: o(9, 5), align: 'center', color: C.acc, alpha: prog(lt, 1.0, 1.5) });
  blurHead([[['“꼭 예약하고 ', C.fg], ['가셔요!”', C.acc]]], W / 2, o(H * 0.66, H * 0.56), lt, 1.4, { size: o(56, 64), align: 'center', weight: 800 });
  subline('— 방문 리뷰', W / 2, o(H * 0.66, H * 0.56) + 50, lt, 1.8, null, { align: 'center' });
  const ik = prog(lt, 2.2, 2.8);
  if (ik > 0) {
    ctx.save(); ctx.globalAlpha = eOutCubic(ik);
    const ly = o(H * 0.76, H * 0.68);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(W / 2 - o(520, 420), ly, o(1040, 840), 1.5);
    if (!V) {
      text(`서울 중구 퇴계로22길 7 · ${COPY.exit}`, W / 2, ly + 62, { weight: 600, size: 30, align: 'center', color: C.fg });
      text(`☎ ${COPY.tel}`, W / 2, ly + 112, { weight: 500, size: 28, align: 'center', color: 'rgba(244,247,245,0.72)' });
    } else {
      text('서울 중구 퇴계로22길 7', W / 2, ly + 70, { weight: 700, size: 38, align: 'center', color: C.fg });
      text(COPY.exit, W / 2, ly + 126, { weight: 600, size: 32, align: 'center', color: 'rgba(244,247,245,0.85)' });
      text(`☎ ${COPY.tel}`, W / 2, ly + 186, { weight: 600, size: 34, align: 'center', color: 'rgba(244,247,245,0.75)' });
    }
    ctx.restore();
  }
  const end = sstep(d - 0.6, d, lt);
  if (end > 0) { ctx.fillStyle = `rgba(0,0,0,${end * 0.85})`; ctx.fillRect(0, 0, W, H); }
}

const SCENES = [
  [T.hook, sHook], [T.scan, sScan], [T.since, sSince], [T.tilt, sTilt], [T.hoe, sHoe], [T.menu, sMenu],
  [T.reviews, sReviews], [T.gather, sGather], [T.montage, sMontage], [T.store, sStore], [T.map, sMap], [T.end, sEnd],
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
// 밝은 빛줄기가 훑고 지나간다 (모임 장면 들어갈 때)
function lightSweep(t, at) {
  const k = prog(t, at - 0.35, at + 0.35);
  if (k <= 0 || k >= 1) return;
  const x = lerp(W * 1.1, -W * 0.1, eInOutCubic(k));
  const a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, 'rgba(150,230,240,0)'); g.addColorStop(0.5, `rgba(200,245,250,${0.85 * a})`); g.addColorStop(1, 'rgba(150,230,240,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// 하얗게 번지는 섬광 (리뷰 장면 들어갈 때)
function whiteBloom(t, at) {
  const a = 1 - clamp(Math.abs(t - at) / 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = eOutCubic(a) * 0.92; ctx.fillStyle = '#f4f1ff'; ctx.fillRect(0, 0, W, H); ctx.restore();
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
  [T.since[0], T.tilt[0], T.hoe[0], T.menu[0], T.montage[0], T.map[0]].forEach(at => whip(t, at));
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
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 40px Pre`, '가A')).concat([document.fonts.load('400 40px Mono', 'A'), document.fonts.load('900 40px NotoKR', '緣日食刺身あア')]));
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
