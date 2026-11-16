/* ============================================================
   숲속우산 참송이버섯 — 상품 소개 모션 (참송이버섯 · 느타리버섯)
   레퍼런스(종이 공예 · 120BPM)의 문법: 크림 종이 → 종이 찢김 → 초록 종이 언덕 → 번호 카드 넷
   → 동그라미 셋(모두 직접) → 언덕 장면 → 마무리. 사진은 받은 실사 이미지(assets/), 지도는 받은 지도를 보고 다시 그린 약도.
   화면 문구는 받은 자료(상품 소개글 · 리뷰 · 주소 · 교통 · 주차 · 전화)에서만.
   window.ORIENT = 'h'(16:9) | 'v'(9:16). 모든 프레임은 시간 t 만으로 결정된다.
   ============================================================ */

/* ---------- 1. 설정 ---------- */
const V = window.ORIENT === 'v';
const W = V ? 1080 : 1920, H = V ? 1920 : 1080, FPS = 30, DUR = 52.0;
const o = (h, v) => (V ? v : h);
const T = {
  hook:   [0, 4.0],      // 포천 숲속에서 키우고, 농장에서 바로 보냅니다
  land:   [4.0, 10.0],   // (종이 찢김) 노부부가 "웃으며 키운" 건강한 버섯
  c1:     [10.0, 14.0],  // 01 참송이버섯
  c2:     [14.0, 18.0],  // 02 느타리버섯
  c3:     [18.0, 22.0],  // 03 친환경 무농약 (인증 제10304983호)
  c4:     [22.0, 26.0],  // 04 100% 국내산 (포천의 맑은 물 · 깨끗한 공기)
  circle: [26.0, 32.0],  // 키우고, 따서, 보내기까지 — 재배부터 판매까지 노부부가 모두 직접
  couple: [32.0, 37.5],  // 웃으며 키운 버섯 (농부 사진 + 종이 노부부)
  review: [37.5, 41.5],  // 고객 후기
  map:    [41.5, 46.5],  // 약도 · 주소 · 주차 · 버스
  end:    [46.5, DUR],   // 숲속우산 참송이버섯 · 전화
};
const C = {
  paper: '#EFEBE2', ink: '#2A2824', ink2: '#5B554C', muted: '#8A8276',
  sky: '#DDEEE8', h0: '#CBE3A8', h1: '#A9D387', h2: '#79BD69', h3: '#4FA454', h4: '#33914A',
  sun: '#F2B53B', sun2: '#F6C75E', cloud: '#FBFAF6',
  teal: '#1F9A85', green: '#45AF5F', navy: '#23396D', red: '#E25A4A', yellow: '#F2B33D', pink: '#E98A8A',
  cap: '#9C5D33', capD: '#6F4023', stem: '#F3E8D3', oys: '#4C4B52', oysL: '#6B6A72',
  hl: '#D5E99C', tape: 'rgba(236,224,190,0.78)', wood: '#A97B4F', woodD: '#7C5534', woodL: '#E6CFA6',
};
const COPY = {
  brand: '숲속우산 참송이버섯', farm: '숲속우산 버섯농원', en: 'Pocheon · Mushroom Farm',
  tel: '010-6395-2676',
  addr: '경기 포천시 창수면 옥수로 49',
  park: '주차 · 옥수로 51 농원 안',
  bus1: '포천시청에서 56번 · 60번 버스', bus2: '창수초등학교 앞 하차',
  cert: '인증 제10304983호',
  review: ['찢어서 마늘소스에', '무쳐 먹으면 간단하고', '맛있더라고요.'],
};

/* ---------- 2. 수학 ---------- */
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOutCubic = k => 1 - Math.pow(1 - clamp(k), 3);
const eInOutCubic = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eOutBack = (k, s = 1.70158) => { k = clamp(k) - 1; return k * k * ((s + 1) * k + s) + 1; };
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* ---------- 3. 종이 질감 (시드 고정 → 워커마다 같은 그림) ---------- */
let PAPER = null;
function buildPaper() {
  PAPER = mk(W, H);
  const g = PAPER.getContext('2d'), r = rng(7);
  const id = g.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 236 + r() * 19; d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 4; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  for (let i = 0; i < 26; i++) {   // 얼룩 (종이 두께 차이)
    const x = r() * W, y = r() * H, rad = 120 + r() * 380, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? '255,255,255' : '215,205,185'},${0.04 + r() * 0.05})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.lineCap = 'round';
  for (let i = 0; i < (W * H) / 900; i++) {   // 섬유
    const x = r() * W, y = r() * H, a = r() * TAU, L = 6 + r() * 26, dark = r() < 0.55;
    g.strokeStyle = dark ? `rgba(120,105,85,${0.05 + r() * 0.10})` : `rgba(255,255,255,${0.35 + r() * 0.4})`;
    g.lineWidth = 0.5 + r() * 1.1;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * L * 0.5, y + Math.sin(a + 0.6) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
}
function paperOverlay(a = 0.55) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(PAPER, 0, 0); ctx.restore(); }

/* ---------- 4. 글자 ---------- */
const FONT = { title: 'Jua', body: 'Dodum', serif: 'Batang', label: 'Pre' };
function setFont(g, f) {
  g.font = `${f.weight ?? 400} ${f.size ?? 60}px ${f.fam ?? FONT.title}`;
  g.textAlign = f.align ?? 'left'; g.textBaseline = 'alphabetic';
  g.letterSpacing = (f.ls ?? 0) + 'px';
}
function text(s, x, y, f = {}) {
  if (!s) return;
  ctx.save(); setFont(ctx, f);
  ctx.globalAlpha *= clamp(f.alpha ?? 1);
  if (f.blur > 0.3) ctx.filter = `blur(${f.blur.toFixed(1)}px)`;
  if (f.italic) { ctx.translate(x, y); ctx.transform(1, 0, -0.2, 1, 0, 0); x = 0; y = 0; }
  ctx.fillStyle = f.color ?? C.ink;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(s, f) { ctx.save(); setFont(ctx, f); const w = ctx.measureText(s).width; ctx.restore(); return w; }
// 글자가 하나씩 톡톡 떨어지며 박힌다 (레퍼런스의 타자). 돌려주는 값: 다 쓴 시각
function typeText(s, x, y, lt, k0, f = {}, out = null) {
  const chars = [...s], rate = f.rate ?? 0.065, d = 0.2;
  const ws = chars.map(c => measure(c, { ...f, align: 'left' }));
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = f.align === 'center' ? x - total / 2 : f.align === 'right' ? x - total : x;
  const ok = out == null ? 0 : prog(lt, out, out + 0.35);
  chars.forEach((c, i) => {
    const k = prog(lt, k0 + i * rate, k0 + i * rate + d);
    if (k > 0 && c !== ' ') {
      const e = eOutBack(k, 2.2), rot = (hash(i * 3.3 + s.length) - 0.5) * 0.7 * (1 - eOutCubic(k));
      ctx.save();
      ctx.translate(cx + ws[i] / 2, y - (f.size ?? 60) * 0.35 - (1 - eOutCubic(k)) * 22);
      ctx.rotate(rot); ctx.scale(lerp(1.4, 1, e), lerp(1.4, 1, e));
      text(c, -ws[i] / 2, (f.size ?? 60) * 0.35, { ...f, align: 'left', alpha: clamp(k * 3) * (1 - ok), blur: ok * 12 });
      ctx.restore();
    }
    cx += ws[i];
  });
  return k0 + chars.length * rate + d;
}
// 형광펜처럼 글자 뒤에 칠하기 (왼쪽부터)
function marker(x, y, w, h, k, color = C.hl, seed = 1) {
  if (k <= 0) return;
  ctx.save(); roughRect(x, y, w * eOutCubic(k), h, seed, 2.2, 14); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}

/* ---------- 5. 종이 조각 ---------- */
function roughRect(x, y, w, h, seed = 1, j = 2.2, step = 16) {
  ctx.beginPath();
  const pts = [];
  const edge = (x0, y0, x1, y1, nx, ny, base) => {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / step));
    for (let i = 0; i < n; i++) { const k = i / n, jj = (hash(seed * 13.7 + base + i * 1.31) - 0.5) * 2 * j; pts.push([lerp(x0, x1, k) + nx * jj, lerp(y0, y1, k) + ny * jj]); }
  };
  edge(x, y, x + w, y, 0, -1, 0); edge(x + w, y, x + w, y + h, 1, 0, 100); edge(x + w, y + h, x, y + h, 0, 1, 200); edge(x, y + h, x, y, -1, 0, 300);
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
}
function roughCircle(cx, cy, r, seed = 1, j = 1.8, n = 72) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, rr = r + (hash(seed * 7.1 + i * 0.77) - 0.5) * 2 * j; i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath();
}
function roughEllipse(cx, cy, rx, ry, seed = 1, j = 1.6, a0 = 0, a1 = TAU, close = true) {
  const n = 64; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), f = 1 + (hash(seed * 5.3 + i * 0.91) - 0.5) * 2 * j / Math.max(rx, ry); const px = cx + Math.cos(a) * rx * f, py = cy + Math.sin(a) * ry * f; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  if (close) ctx.closePath();
}
// 그림자 있는 종이 칠하기
function paper(fill, sh = 1, dy = 5) {
  ctx.save();
  if (sh > 0) { ctx.shadowColor = `rgba(45,38,25,${0.26 * sh})`; ctx.shadowBlur = 10 * sh; ctx.shadowOffsetY = dy * sh; ctx.shadowOffsetX = 1.5 * sh; }
  ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}
// 가운데를 축으로 튀어나오기 (k: 0→1)
function popAt(x, y, k, fn, rot = 0) {
  if (k <= 0) return;
  const s = eOutBack(k, 2.0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * (1 - clamp(k))); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2.5); fn(); ctx.restore();
}
function blurOut(lt, a, fn) {   // a 부터 0.4초 동안 흐려지며 사라진다
  const k = prog(lt, a, a + 0.4);
  if (k >= 1) return;
  ctx.save(); if (k > 0) { ctx.filter = `blur(${(k * 14).toFixed(1)}px)`; ctx.globalAlpha *= 1 - k; } fn(); ctx.restore();
}

/* ---------- 6. 사진 ---------- */
const IMG = {};
function loadImg(k, src) { return new Promise(res => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => res(); im.src = src; }); }
async function loadPhotos() { await Promise.all(['oyster_box', 'oyster_cluster', 'chamsong_logs', 'dish', 'farmer'].map(k => loadImg(k, `assets/${k}.jpg`))); }
function cover(img, x, y, w, h, fx = 0.5, fy = 0.5, z = 1) {
  if (!img) { ctx.fillStyle = '#887'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / img.width, h / img.height) * z, dw = img.width * s, dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
}
// 즉석 사진 (흰 테두리 + 마스킹 테이프)
function polaroid(img, cx, cy, w, h, rot, k, seed = 1, o2 = {}) {
  popAt(cx, cy, k, () => {
    const m = o2.m ?? 18, mb = o2.mb ?? 56;
    roughRect(-w / 2 - m, -h / 2 - m, w + m * 2, h + m + mb, seed, 1.6, 20); paper('#FBFAF5', 1.3, 8);
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    cover(img, -w / 2, -h / 2, w, h, o2.fx ?? 0.5, o2.fy ?? 0.5, o2.z ?? 1); ctx.restore();
    if (o2.cap) text(o2.cap, 0, h / 2 + mb * 0.62, { fam: FONT.title, size: o2.capSize ?? 30, align: 'center', color: C.ink2 });
    ctx.save(); ctx.rotate(-0.06); roughRect(-60, -h / 2 - m - 18, 120, 38, seed + 9, 1.4, 10); ctx.fillStyle = C.tape; ctx.fill(); ctx.restore();
  }, rot);
  return;
}

/* ---------- 7. 배경 ---------- */
function cream() { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
const HILL = V
  ? [[0.60, 26, 1.3, 0.2], [0.665, 22, 1.7, 1.9], [0.73, 20, 1.1, 3.1], [0.80, 16, 2.3, 4.4], [0.875, 10, 1.6, 0.7]]
  : [[0.55, 30, 1.6, 0.2], [0.63, 26, 2.1, 1.9], [0.71, 22, 1.4, 3.1], [0.80, 18, 2.8, 4.4], [0.90, 10, 2.0, 0.7]];
const HCOL = [C.h0, C.h1, C.h2, C.h3, C.h4];
const GROUND = H * o(0.885, 0.90);
function hillY(i, x) { const [b, A, f, p] = HILL[i]; return H * b + Math.sin(x / W * f * TAU + p) * A + Math.sin(x / W * f * 2.7 * TAU + p * 1.7) * A * 0.35; }
function cloud(x, y, s, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  [[-60, 0, 38], [-20, -26, 46], [28, -18, 40], [62, 2, 30], [0, 6, 40]].forEach(([cx, cy, r], i) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r + (hash(seed + i) - 0.5) * 4, 0, TAU); });
  ctx.rect(-92, 0, 182, 30);
  paper(C.cloud, 0.8, 4);
  ctx.restore();
}
function landscape(t, o2 = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.7); g.addColorStop(0, '#D5EAE4'); g.addColorStop(1, '#E8F2EC');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 해
  const sx = W * o(0.865, 0.80), sy = H * o(0.21, 0.15) + Math.sin(t * 0.8) * 4, sr = o(76, 82);
  roughCircle(sx, sy, sr, 3, 1.6); paper(C.sun, 0.7, 4);
  roughCircle(sx - sr * 0.18, sy - sr * 0.2, sr * 0.62, 4, 1.4); ctx.fillStyle = C.sun2; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
  // 구름 (천천히 흐른다)
  const cl = V ? [[0.16, 0.07, 1.0, 1], [0.62, 0.05, 1.15, 2], [0.88, 0.20, 0.8, 3], [0.30, 0.25, 0.7, 4]]
               : [[0.09, 0.12, 0.95, 1], [0.32, 0.06, 1.1, 2], [0.62, 0.10, 0.9, 3], [0.92, 0.19, 0.75, 4]];
  cl.forEach(([cx, cy, s, sd]) => cloud(((cx * W + t * 9 * s) % (W + 300)) - 0, cy * H, s * o(1, 1.1), sd));
  // 언덕 다섯 겹 (앞 겹이 뒤 겹에 그림자)
  HILL.forEach((_, i) => {
    ctx.beginPath(); ctx.moveTo(-20, H + 20);
    for (let x = -20; x <= W + 20; x += 12) ctx.lineTo(x, hillY(i, x) + (hash(i * 31 + x * 0.13) - 0.5) * 1.6);
    ctx.lineTo(W + 20, H + 20); ctx.closePath();
    ctx.save(); ctx.shadowColor = 'rgba(30,60,30,0.20)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = -4; ctx.fillStyle = HCOL[i]; ctx.fill(); ctx.restore();
  });
  // 가장자리 풀잎
  if (o2.leaves !== false) {
    [[o(20, 10), 1, -0.25], [W - o(30, 16), -1, 0.3]].forEach(([x, dir, r], j) => {
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.translate(x + dir * i * 26, H + 10); ctx.rotate(r * dir * (1 + i * 0.4) + Math.sin(t * 1.4 + i + j) * 0.03);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-26, -90 - i * 30, 6 * dir, -170 - i * 34); ctx.quadraticCurveTo(26, -80 - i * 20, 0, 0);
        paper(i % 2 ? '#2E7F40' : '#3A9150', 0.8, 3); ctx.restore();
      }
    });
  }
}

/* ---------- 8. 그림 (종이로 오린 소품) ---------- */
// 참송이: 갈색 둥근 갓 + 크림색 대 (k: 자라는 정도)
function chamsong(x, y, s, k = 1, seed = 1, tilt = 0) {
  if (k <= 0) return;
  const e = eOutBack(k, 1.6);
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  const sh = 80 * eOutCubic(k);
  ctx.beginPath(); ctx.moveTo(-17, 0); ctx.quadraticCurveTo(-22, -sh * 0.5, -14, -sh); ctx.lineTo(14, -sh); ctx.quadraticCurveTo(22, -sh * 0.5, 17, 0); ctx.closePath();
  paper(C.stem, 0.8, 3);
  ctx.translate(0, -sh); ctx.scale(e, e);
  roughEllipse(0, 4, 60, 12, seed + 2, 1.2); paper('#D9C3A0', 0.6, 2);
  roughEllipse(0, 4, 62, 54, seed, 1.6, Math.PI, TAU, true); paper(C.cap, 0.9, 4);
  ctx.save(); roughEllipse(0, 4, 62, 54, seed, 1.6, Math.PI, TAU, true); ctx.clip();
  roughEllipse(-14, -26, 30, 16, seed + 5, 1.2); ctx.fillStyle = 'rgba(255,230,190,0.18)'; ctx.fill();
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-44 + hash(seed + i) * 88, -6 - hash(seed * 3 + i) * 40, 4 + hash(i + 2) * 3, 2.4, hash(i) * 3, 0, TAU); ctx.fillStyle = 'rgba(245,225,195,0.75)'; ctx.fill(); }
  ctx.restore();
  ctx.restore();
}
// 느타리: 짙은 회색 깔때기 갓 다발 + 흰 대
function oyster(x, y, s, k = 1, seed = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const caps = [[-46, -96, -0.5, 0.8], [44, -104, 0.45, 0.85], [-8, -128, 0.05, 1.0], [-62, -40, -0.9, 0.7], [64, -48, 0.9, 0.72]];
  caps.forEach(([cx, cy, rot, sz], i) => {
    const kk = eOutBack(prog(k, i * 0.12, i * 0.12 + 0.55), 1.8);
    if (kk <= 0) return;
    ctx.save(); ctx.rotate(rot * 0.25);
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(cx * 0.4 - 14, cy * 0.5, cx * kk - 10 * sz, cy * kk + 8); ctx.lineTo(cx * kk + 10 * sz, cy * kk + 8); ctx.quadraticCurveTo(cx * 0.4 + 14, cy * 0.5, 12, 0); ctx.closePath();
    paper('#F4F1EA', 0.7, 3);
    ctx.translate(cx * kk, cy * kk); ctx.rotate(rot); ctx.scale(kk * sz, kk * sz);
    roughEllipse(0, 0, 58, 22, seed + i, 1.4); paper(i % 2 ? C.oys : C.oysL, 0.9, 4);
    roughEllipse(0, -3, 30, 9, seed + i + 9, 1.0); ctx.fillStyle = 'rgba(30,28,34,0.45)'; ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
function sparkle(x, y, r, k, color = C.yellow) {
  if (k <= 0) return;
  const s = r * Math.sin(clamp(k) * Math.PI);
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8 - Math.PI / 2, rr = i % 2 ? s * 0.28 : s; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function confetti(t, lt, spots) {
  spots.forEach(([x, y, kind, col, at], i) => {
    const k = prog(lt, at, at + 0.3);
    if (k <= 0) return;
    popAt(x + Math.sin(t * 0.9 + i) * 4, y + Math.cos(t * 0.7 + i) * 4, k, () => {
      ctx.fillStyle = col; ctx.rotate(hash(i * 9) * TAU + t * 0.15 * (i % 2 ? 1 : -1));
      if (kind === 't') { ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(12, 9); ctx.lineTo(-12, 9); ctx.closePath(); ctx.fill(); }
      else if (kind === 's') ctx.fillRect(-8, -8, 16, 16);
      else { ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); }
    });
  });
}
// 통나무 배지 (참송이가 자라는 곳)
function logBlock(x, y, w, h) {
  roughRect(x - w / 2, y - h, w, h, 21, 2.4, 18); paper(C.wood, 1, 6);
  ctx.save(); roughRect(x - w / 2, y - h, w, h, 21, 2.4, 18); ctx.clip();
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(80,50,25,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h + 16 + i * (h / 6)); ctx.bezierCurveTo(x - w / 6, y - h + 10 + i * (h / 6), x + w / 6, y - h + 24 + i * (h / 6), x + w / 2, y - h + 14 + i * (h / 6)); ctx.stroke(); }
  ctx.restore();
  roughEllipse(x + w / 2, y - h / 2, h * 0.32, h / 2, 23, 1.4); paper(C.woodL, 0.6, 2);
  for (let r = 1; r <= 3; r++) { ctx.beginPath(); ctx.ellipse(x + w / 2, y - h / 2, h * 0.32 * r / 4, h / 2 * r / 4, 0, 0, TAU); ctx.strokeStyle = 'rgba(124,85,52,0.5)'; ctx.lineWidth = 2; ctx.stroke(); }
}
// 비닐 버섯 하우스
function hoopHouse(x, y, w, h) {
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.45); ctx.quadraticCurveTo(x - w / 2, y - h, x, y - h); ctx.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h * 0.45); ctx.lineTo(x + w / 2, y); ctx.closePath();
  paper('#E4EEF0', 1, 6);
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(120,140,150,0.45)'; ctx.lineWidth = 3;
  for (let i = 1; i < 6; i++) { const xx = x - w / 2 + (w * i) / 6; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y - h); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - h * 0.45); ctx.lineTo(x + w / 2, y - h * 0.45); ctx.stroke();
  ctx.restore();
  roughRect(x - w * 0.09, y - h * 0.42, w * 0.18, h * 0.42, 33, 1.4, 12); paper('#B9CBD0', 0.6, 2);
}
// 종이 노부부 (할아버지: 모자 · 안경 / 할머니: 머릿수건 · 앞치마 · 버섯 바구니)
function grandpa(x, y, s, t) {
  const b = Math.abs(Math.sin(t * Math.PI * 2)) * 5;
  ctx.save(); ctx.translate(x, y - b); ctx.scale(s, s);
  roughRect(-34, -150, 30, 150, 41, 1.2, 14); paper('#2A3557', 0.8, 3);
  roughRect(4, -150, 30, 150, 42, 1.2, 14); paper('#2A3557', 0.8, 3);
  roughRect(-40, -8, 38, 14, 43, 1, 10); paper('#3A2A20', 0.6, 2); roughRect(2, -8, 38, 14, 44, 1, 10); paper('#3A2A20', 0.6, 2);
  roughRect(-56, -290, 112, 150, 45, 1.6, 14); paper('#B9D8C8', 1, 4);   // 셔츠
  ctx.save(); ctx.translate(-52, -276); ctx.rotate(2.3 + Math.sin(t * 6) * 0.35);   // 흔드는 팔 (바깥쪽)
  roughRect(-13, 0, 26, 92, 46, 1, 12); paper('#B9D8C8', 0.7, 3); roughCircle(0, 100, 15, 47, 1); paper('#EBC3A0', 0.6, 2); ctx.restore();
  ctx.save(); ctx.translate(52, -276); ctx.rotate(-0.35); roughRect(-13, 0, 26, 100, 48, 1, 12); paper('#B9D8C8', 0.7, 3); roughCircle(0, 108, 15, 49, 1); paper('#EBC3A0', 0.6, 2); ctx.restore();
  roughCircle(0, -338, 48, 50, 1.4); paper('#EFC7A3', 0.9, 3);   // 얼굴
  roughEllipse(0, -368, 54, 30, 51, 1.2, Math.PI, TAU); paper('#5B6B78', 0.9, 3);   // 모자
  roughEllipse(18, -366, 52, 9, 52, 1); paper('#4B5A66', 0.6, 2);
  ctx.strokeStyle = '#3A3530'; ctx.lineWidth = 3.4;
  [-17, 17].forEach(ex => { ctx.beginPath(); ctx.arc(ex, -336, 11, 0, TAU); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(-6, -336); ctx.lineTo(6, -336); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -318, 16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();   // 웃는 입
  ctx.fillStyle = 'rgba(232,120,110,0.45)'; [-30, 30].forEach(ex => { ctx.beginPath(); ctx.arc(ex, -318, 8, 0, TAU); ctx.fill(); });
  ctx.restore();
}
function grandma(x, y, s, t) {
  const b = Math.abs(Math.sin(t * Math.PI * 2 + 1.2)) * 5;
  ctx.save(); ctx.translate(x, y - b); ctx.scale(s, s);
  roughRect(-30, -130, 26, 130, 61, 1.2, 14); paper('#6E5546', 0.8, 3); roughRect(4, -130, 26, 130, 62, 1.2, 14); paper('#6E5546', 0.8, 3);
  roughRect(-36, -8, 34, 13, 63, 1, 10); paper('#3A2A20', 0.6, 2); roughRect(2, -8, 34, 13, 64, 1, 10); paper('#3A2A20', 0.6, 2);
  roughRect(-54, -270, 108, 150, 65, 1.6, 14); paper('#E9A6A0', 1, 4);   // 블라우스
  roughRect(-40, -220, 80, 116, 66, 1.4, 12); paper('#F4D27A', 0.7, 3);  // 앞치마
  // 바구니 (버섯 담긴)
  ctx.save(); ctx.translate(-66, -150);
  chamsong(-18, -6, 0.22, 1, 70); chamsong(10, -10, 0.24, 1, 71); chamsong(30, -4, 0.2, 1, 72);
  roughEllipse(6, 0, 52, 30, 67, 1.4, 0, Math.PI); paper('#B98A56', 0.9, 3);
  ctx.strokeStyle = '#8E6538'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, 8); ctx.lineTo(52, 8); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.translate(-50, -256); ctx.rotate(0.55); roughRect(-12, 0, 24, 90, 68, 1, 12); paper('#E9A6A0', 0.7, 3); ctx.restore();
  ctx.save(); ctx.translate(50, -256); ctx.rotate(-0.4 + Math.sin(t * 5 + 1) * 0.2); roughRect(-12, 0, 24, 92, 69, 1, 12); paper('#E9A6A0', 0.7, 3); roughCircle(0, 100, 14, 73, 1); paper('#EBC3A0', 0.6, 2); ctx.restore();
  roughCircle(0, -318, 46, 74, 1.4); paper('#EFC7A3', 0.9, 3);
  ctx.beginPath(); ctx.moveTo(-54, -318); ctx.quadraticCurveTo(-50, -380, 0, -382); ctx.quadraticCurveTo(50, -380, 54, -318); ctx.quadraticCurveTo(40, -352, 0, -354); ctx.quadraticCurveTo(-40, -352, -54, -318); ctx.closePath();
  paper('#C8463D', 0.9, 3);   // 머릿수건
  ctx.beginPath(); ctx.moveTo(48, -330); ctx.lineTo(74, -312); ctx.lineTo(56, -306); ctx.closePath(); paper('#C8463D', 0.6, 2);
  ctx.strokeStyle = '#3A3530'; ctx.lineWidth = 3.4;
  [-16, 16].forEach(ex => { ctx.beginPath(); ctx.arc(ex, -322, 7, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke(); });   // 웃는 눈
  ctx.beginPath(); ctx.arc(0, -302, 14, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.fillStyle = 'rgba(232,120,110,0.5)'; [-28, 28].forEach(ex => { ctx.beginPath(); ctx.arc(ex, -300, 8, 0, TAU); ctx.fill(); });
  ctx.restore();
}
function heart(x, y, s, col = C.red) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-26, -8, -14, -30, 0, -16); ctx.bezierCurveTo(14, -30, 26, -8, 0, 10); ctx.closePath();
  paper(col, 0.6, 2); ctx.restore();
}
// 흰 아이콘들 (동그라미 안)
function iconSprout(s) {   // 키우고: 버섯이 자라는 모양
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-12, 40); ctx.lineTo(-9, -4); ctx.lineTo(9, -4); ctx.lineTo(12, 40); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -4, 46, 40, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.fillRect(-46, 40, 92, 8);
  ctx.restore();
}
function iconBasket(s) {   // 따서: 바구니
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -4, 30, Math.PI, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(50, -4); ctx.lineTo(38, 40); ctx.lineTo(-38, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 16 - 2, 4, 4, 30);
  ctx.restore();
}
function iconBox(s) {   // 보내기까지: 택배 상자 + 하트
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-46, -20); ctx.lineTo(0, -40); ctx.lineTo(46, -20); ctx.lineTo(46, 34); ctx.lineTo(0, 50); ctx.lineTo(-46, 34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-46, -20); ctx.lineTo(0, -2); ctx.lineTo(46, -20); ctx.moveTo(0, -2); ctx.lineTo(0, 50); ctx.stroke();
  ctx.translate(-20, 18); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-16, -4, -8, -18, 0, -9); ctx.bezierCurveTo(8, -18, 16, -4, 0, 8); ctx.fill();
  ctx.restore();
}
// 우산 버섯 로고 (숲속우산)
function logoMark(x, y, s, k) {
  popAt(x, y, k, () => {
    ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-10, 70); ctx.quadraticCurveTo(-10, 96, 14, 96); ctx.quadraticCurveTo(34, 96, 34, 76);
    ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = C.stem; ctx.save(); ctx.shadowColor = 'rgba(45,38,25,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-120, -6);
    for (let i = 0; i <= 4; i++) { const xa = -120 + i * 60; ctx.quadraticCurveTo(xa + 30, 14, xa + 60, -6); }
    ctx.quadraticCurveTo(110, -110, 0, -116); ctx.quadraticCurveTo(-110, -110, -120, -6); ctx.closePath();
    paper(C.cap, 1, 6);
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(245,225,195,0.8)';
    [[-60, -60, 10], [-10, -86, 8], [40, -64, 11], [72, -30, 7], [-84, -28, 7], [6, -40, 7]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fill(); });
    ctx.restore();
    [[-150, 70, 0.9], [150, 70, 0.9]].forEach(([tx, ty, sc]) => {   // 숲 (작은 나무 둘)
      ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc);
      ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(36, 0); ctx.lineTo(-36, 0); ctx.closePath(); paper(C.green, 0.8, 3);
      ctx.fillStyle = C.woodD; ctx.fillRect(-5, 0, 10, 18); ctx.restore();
    });
  });
}
// 지도 핀 (나무 두 그루 표시)
function pin(x, y, s, k) {
  popAt(x, y, k, () => {
    ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-14, -26, -38, -44, -38, -72); ctx.arc(0, -72, 38, Math.PI, 0); ctx.bezierCurveTo(38, -44, 14, -26, 0, 0); ctx.closePath();
    paper(C.red, 1, 5);
    ctx.fillStyle = '#fff';
    [[-11, -62], [11, -62]].forEach(([tx, ty]) => { ctx.beginPath(); ctx.moveTo(tx, ty - 28); ctx.lineTo(tx + 11, ty); ctx.lineTo(tx - 11, ty); ctx.closePath(); ctx.fill(); ctx.fillRect(tx - 2, ty, 4, 7); });
  });
}
function infoIcon(x, y, kind, col, k) {
  popAt(x, y, k, () => {
    roughCircle(0, 0, 30, kind.length * 7, 1.2); paper(col, 0.8, 3);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    if (kind === 'pin') { ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-6, 4, -14, -2, -14, -8); ctx.arc(0, -8, 14, Math.PI, 0); ctx.bezierCurveTo(14, -2, 6, 4, 0, 14); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -8, 5, 0, TAU); ctx.fill(); }
    else if (kind === 'park') text('P', 0, 13, { fam: FONT.title, size: 40, align: 'center', color: '#fff' });
    else if (kind === 'bus') { roughRect(-15, -15, 30, 26, 5, 0.6, 8); ctx.fill(); ctx.fillStyle = col; ctx.fillRect(-11, -11, 22, 9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, 14, 4, 0, TAU); ctx.arc(8, 14, 4, 0, TAU); ctx.fill(); }
    else if (kind === 'tel') phoneGlyph(0, 0, 0.9, '#fff');
  });
}
function phoneGlyph(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.6); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(6, -20); ctx.quadraticCurveTo(10, -20, 10, -14); ctx.lineTo(10, -8); ctx.quadraticCurveTo(10, -4, 6, -4); ctx.lineTo(3, -4); ctx.lineTo(3, 4); ctx.lineTo(6, 4); ctx.quadraticCurveTo(10, 4, 10, 8); ctx.lineTo(10, 14); ctx.quadraticCurveTo(10, 20, 6, 20); ctx.lineTo(-6, 20); ctx.quadraticCurveTo(-10, 20, -10, 14); ctx.lineTo(-10, -14); ctx.quadraticCurveTo(-10, -20, -6, -20); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- 9. 장면 ---------- */
// 9-1. 시작: 크림 종이 + 버섯 소품 + 타자
function sHook(lt, t) {
  cream();
  const iy = o(230, 560);
  popAt(W / 2 - o(150, 150), iy + 40, prog(lt, 0.05, 0.4), () => chamsong(0, 80, o(1.45, 1.5), 1, 5, -0.06), -0.4);
  popAt(W / 2 + o(150, 150), iy + 40, prog(lt, 0.35, 0.7), () => oyster(0, 90, o(1.1, 1.15), 1, 9), 0.4);
  const f = { fam: FONT.title, size: o(100, 82), align: 'center', color: C.ink };
  const y1 = o(590, 960), y2 = y1 + o(125, 108);
  const e1 = typeText('포천 숲속에서 키우고,', W / 2, y1, lt, 0.55, f);
  typeText('농장에서 바로 보냅니다.', W / 2, y2, lt, e1 + 0.05, f);
  confetti(t, lt, V
    ? [[170, 470, 'd', C.green, 0.3], [880, 520, 't', C.red, 0.5], [140, 1180, 's', C.teal, 0.7], [930, 1210, 'd', C.yellow, 0.9], [300, 1330, 'd', C.pink, 1.1], [820, 1360, 't', C.navy, 1.3]]
    : [[560, 170, 'd', C.green, 0.3], [1360, 200, 't', C.red, 0.5], [450, 660, 's', C.teal, 0.7], [1500, 690, 'd', C.yellow, 0.9], [640, 800, 'd', C.pink, 1.1], [1420, 820, 't', C.navy, 1.3]]);
}
// 9-2. 언덕 + 자라는 버섯 + 제목
function sLand(lt, t) {
  landscape(t);
  const mx = W * o(0.68, 0.5), gy = GROUND;
  const soil = prog(lt, 0.35, 0.7);
  if (soil > 0) { ctx.save(); ctx.translate(mx, gy); ctx.scale(eOutBack(soil), eOutBack(soil)); roughEllipse(0, 0, o(150, 170), o(34, 38), 81, 2, Math.PI, TAU); paper('#8A6243', 1, 4); ctx.restore(); }
  chamsong(mx - o(70, 80), gy - 6, o(0.9, 1.0), prog(lt, 0.8, 1.6), 82, -0.12);
  chamsong(mx + o(10, 10), gy - 12, o(1.25, 1.4), prog(lt, 1.1, 2.0), 83, 0.04);
  chamsong(mx + o(90, 100), gy - 4, o(0.75, 0.85), prog(lt, 1.4, 2.2), 84, 0.15);
  [[-150, -120, 2.0], [140, -170, 2.2], [40, -260, 2.4]].forEach(([dx, dy, at], i) => sparkle(mx + dx * o(1, 1.1), gy + dy * o(1, 1.1), 18, prog(lt, at, at + 0.7), i % 2 ? C.yellow : '#fff'));
  blurOut(lt, 5.55, () => {
    const x = o(110, 80), y0 = o(330, 470), big = o(108, 104);
    typeText('노부부가', x, y0, lt, 0.9, { fam: FONT.title, size: o(54, 54), color: C.ink2 });
    const l1 = '웃으며 키운', fb = { fam: FONT.title, size: big, color: C.ink };
    const w1 = measure(l1, fb);
    marker(x - 8, y0 + o(66, 66), w1 + 18, big * 0.4, prog(lt, 2.3, 2.8), C.hl, 5);
    const e1 = typeText(l1, x, y0 + o(118, 118), lt, 1.3, fb);
    typeText('건강한 버섯.', x, y0 + o(118, 118) + big * 1.18, lt, e1 + 0.05, fb);
    typeText(COPY.en, x + 4, y0 + o(118, 118) + big * 1.18 + o(64, 66), lt, 2.9, { fam: FONT.serif, weight: 700, size: o(34, 34), color: C.teal, italic: true, rate: 0.035 });
  });
}
// 9-3. 번호 카드 (레퍼런스: 흰 종이 카드 + 색 번호 + 오른쪽 그림)
const CARDS = {
  c1: { n: '01', col: C.green, label: 'CHAMSONGI', title: '참송이버섯', sub: '향과 식감이 뛰어난 포천 버섯' },
  c2: { n: '02', col: C.navy, label: 'OYSTER', title: '느타리버섯', sub: '포천에서 정성껏 길렀어요' },
  c3: { n: '03', col: C.teal, label: 'NO PESTICIDE', title: '친환경 무농약', sub: `${COPY.cert} · 농약 없이` },
  c4: { n: '04', col: C.red, label: '100% KOREA', title: '100% 국내산', sub: '포천의 맑은 물과 깨끗한 공기' },
};
function card(c, lt) {
  const x = o(110, 70), y = o(210, 300), w = o(700, 940), h = o(270, 290);
  blurOut(lt, 3.55, () => {
    const k = prog(lt, 0.1, 0.45);
    if (k <= 0) return;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.012); const s = lerp(0.92, 1, eOutCubic(k)); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2); ctx.translate(-(x + w / 2), -(y + h / 2));
    roughRect(x, y, w, h, c.n.charCodeAt(1), 2.2, 18); paper('#FBFAF6', 1.2, 7);
    ctx.restore();
    popAt(x + 18, y + 14, prog(lt, 0.3, 0.6), () => { roughCircle(0, 0, o(50, 52), 9, 1.4); paper(c.col, 0.9, 3); text(c.n, 0, o(17, 18), { fam: FONT.serif, weight: 700, size: o(46, 48), align: 'center', color: '#fff' }); });
    typeText(c.label, x + o(100, 104), y + o(66, 68), lt, 0.5, { fam: FONT.label, weight: 600, size: o(20, 22), ls: 5, color: c.col, rate: 0.03 });
    const e = typeText(c.title, x + o(60, 64), y + o(170, 178), lt, 0.7, { fam: FONT.title, size: o(84, 92), color: C.ink });
    typeText(c.sub, x + o(62, 66), y + o(230, 246), lt, e + 0.05, { fam: FONT.body, size: o(34, 38), color: C.ink2, rate: 0.035 });
  });
}
const ILL = V ? { x: 540, y: GROUND } : { x: 1400, y: GROUND };
function sCards(key) {
  return (lt, t) => {
    landscape(t);
    const c = CARDS[key], X = ILL.x, Y = ILL.y;
    blurOut(lt, 3.55, () => {
      if (key === 'c1') {
        polaroid(IMG.chamsong_logs, X + o(200, 150), Y - o(470, 760), o(330, 420), o(420, 520), 0.05, prog(lt, 0.45, 0.85), 11, { fy: 0.4 });
        const lk = prog(lt, 0.25, 0.6);
        if (lk > 0) { ctx.save(); ctx.translate(X - o(150, 150), Y); ctx.scale(eOutBack(lk), eOutBack(lk)); logBlock(0, 0, o(330, 380), o(100, 115)); ctx.restore(); }
        [[-110, -0.2, 0.7], [-20, 0.05, 0.95], [70, 0.18, 0.65]].forEach(([dx, tl, sc], i) => chamsong(X - o(150, 150) + dx * o(1, 1.15), Y - o(98, 112), sc * o(1, 1.15), prog(lt, 0.7 + i * 0.18, 1.3 + i * 0.18), 90 + i, tl));
      } else if (key === 'c2') {
        polaroid(IMG.oyster_box, X + o(150, 170), Y - o(560, 1020), o(360, 440), o(270, 330), 0.06, prog(lt, 0.7, 1.05), 13);
        polaroid(IMG.oyster_cluster, X - o(80, 120), Y - o(470, 720), o(280, 380), o(380, 520), -0.05, prog(lt, 0.45, 0.85), 12, { fy: 0.35 });
        oyster(X + o(230, 290), Y - 4, o(0.85, 0.95), prog(lt, 0.9, 1.8), 30);
      } else if (key === 'c3') {
        const bx = X - o(40, 0), by = Y - o(400, 640), br = o(160, 190);
        popAt(bx, by, prog(lt, 0.4, 0.8), () => {
          roughCircle(0, 0, br, 17, 2); paper(C.green, 1.2, 6);
          roughCircle(0, 0, br * 0.84, 18, 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 4; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
          ctx.save(); ctx.translate(0, -br * 0.38); ctx.rotate(-0.5); ctx.beginPath(); ctx.moveTo(0, 26); ctx.quadraticCurveTo(-30, 0, 0, -30); ctx.quadraticCurveTo(30, 0, 0, 26); ctx.fillStyle = '#E8F5D8'; ctx.fill(); ctx.restore();
          text('무농약', 0, br * 0.16, { fam: FONT.title, size: br * 0.44, align: 'center', color: '#fff' });
          text('친환경', 0, br * 0.48, { fam: FONT.title, size: br * 0.2, align: 'center', color: '#E8F5D8' });
        }, -0.3);
        popAt(bx, by + br + o(40, 50), prog(lt, 0.9, 1.2), () => { roughRect(-o(170, 200), -30, o(340, 400), 60, 19, 1.6, 14); paper('#FBFAF6', 1, 4); text(COPY.cert, 0, 12, { fam: FONT.title, size: o(32, 38), align: 'center', color: C.teal }); });
        [[-1, -1, 1.2], [1, -0.6, 1.4], [0.9, 0.9, 1.6], [-1.1, 0.7, 1.8]].forEach(([dx, dy, at], i) => sparkle(bx + dx * br * 1.25, by + dy * br * 1.05, 20, prog(lt, at, at + 0.8), i % 2 ? C.yellow : '#fff'));
        chamsong(X + o(230, 300), Y - 4, o(0.8, 0.9), prog(lt, 1.0, 1.7), 95, 0.1);
        oyster(X - o(260, 300), Y - 2, o(0.6, 0.7), prog(lt, 1.2, 2.0), 31);
      } else {
        const sx = X - o(120, 150), sy = Y - o(420, 680), sr = o(140, 160);
        popAt(sx, sy, prog(lt, 0.4, 0.8), () => {
          roughCircle(0, 0, sr, 27, 2); paper(C.red, 1.2, 6);
          roughCircle(0, 0, sr * 0.82, 28, 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.stroke();
          text('100%', 0, sr * 0.06, { fam: FONT.title, size: sr * 0.5, align: 'center', color: '#fff' });
          text('국내산', 0, sr * 0.44, { fam: FONT.title, size: sr * 0.27, align: 'center', color: '#FFE3DD' });
        }, 0.3);
        popAt(X + o(190, 180), Y - o(470, 780), prog(lt, 0.7, 1.05), () => {   // 맑은 물방울
          ctx.beginPath(); ctx.moveTo(0, -80); ctx.bezierCurveTo(30, -36, 54, -6, 54, 22); ctx.arc(0, 22, 54, 0, Math.PI); ctx.bezierCurveTo(-54, -6, -30, -36, 0, -80); ctx.closePath(); paper('#6FB7DA', 1, 5);
          ctx.beginPath(); ctx.ellipse(-20, 14, 9, 18, 0.3, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
        });
        popAt(X + o(190, 180), Y - o(310, 600), prog(lt, 1.0, 1.3), () => { roughRect(-o(150, 170), -30, o(300, 340), 60, 29, 1.6, 14); paper('#FBFAF6', 1, 4); text('베타글루칸 풍부', 0, 12, { fam: FONT.title, size: o(32, 36), align: 'center', color: C.navy }); });
        oyster(X + o(240, 300), Y - 4, o(0.7, 0.8), prog(lt, 1.1, 1.9), 32);
        chamsong(X - o(300, 330), Y - 4, o(0.85, 0.95), prog(lt, 1.2, 1.9), 96, -0.1);
      }
    });
    card(c, lt);
  };
}
// 9-4. 동그라미 셋: 키우고, 따서, 보내기까지
function sCircle(lt, t) {
  cream();
  const items = [[C.green, iconSprout, '키우고,'], [C.teal, iconBasket, '따서,'], [C.navy, iconBox, '보내기까지.']];
  const r = o(112, 100);
  const pos = V ? items.map((_, i) => [250, 560 + i * 330]) : items.map((_, i) => [W / 2 - 420 + i * 420, 420]);
  // 점선
  for (let i = 0; i < 2; i++) {
    const k = prog(lt, 0.55 + i * 0.8, 0.95 + i * 0.8);
    if (k <= 0) continue;
    const [x0, y0] = pos[i], [x1, y1] = pos[i + 1];
    ctx.save(); ctx.strokeStyle = '#C7AE84'; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
    ctx.beginPath();
    if (V) { ctx.moveTo(x0, y0 + r + 10); ctx.lineTo(x0, lerp(y0 + r + 10, y1 - r - 10, k)); }
    else { ctx.moveTo(x0 + r + 10, y0); ctx.lineTo(lerp(x0 + r + 10, x1 - r - 10, k), y0); }
    ctx.stroke(); ctx.restore();
  }
  items.forEach(([col, icon, label], i) => {
    const [x, y] = pos[i], at = 0.25 + i * 0.8;
    popAt(x, y, prog(lt, at, at + 0.4), () => { roughCircle(0, 0, r, 40 + i, 2); paper(col, 1.1, 6); icon(o(1.15, 1.05)); });
    const f = { fam: FONT.title, size: o(80, 88), align: V ? 'left' : 'center', color: C.ink };
    if (V) typeText(label, x + r + 50, y + 30, lt, at + 0.25, f);
    else typeText(label, x, y + r + 110, lt, at + 0.25, f);
  });
  const fs = { fam: FONT.body, size: o(44, 50), align: 'center', color: C.ink2, rate: 0.045 };
  if (V) { const e = typeText('재배부터 판매까지,', W / 2, 1600, lt, 2.9, fs); typeText('노부부가 모두 직접.', W / 2, 1675, lt, e, { ...fs, color: C.teal, fam: FONT.title, size: 60 }); }
  else { const e = typeText('재배부터 판매까지, ', W / 2 - 170, 820, lt, 2.9, { ...fs }); typeText('노부부가 모두 직접.', W / 2 + 230, 822, lt, e, { ...fs, color: C.teal, fam: FONT.title, size: 52 }); }
  confetti(t, lt, V ? [[900, 380, 't', C.red, 0.4], [960, 1260, 'd', C.yellow, 1.2], [120, 1460, 's', C.teal, 2.0]]
                    : [[250, 220, 't', C.red, 0.4], [1680, 250, 'd', C.yellow, 1.2], [1700, 860, 's', C.teal, 2.0], [230, 880, 'd', C.pink, 2.4]]);
}
// 9-5. 노부부 (농부 사진 + 종이 노부부 + 하트)
function sCouple(lt, t) {
  landscape(t);
  const gy = GROUND;
  popAt(W * o(0.86, 0.22), gy - 2, prog(lt, 0.2, 0.55), () => hoopHouse(0, 0, o(420, 380), o(250, 230)));
  const cx = W * o(0.80, 0.70);
  popAt(cx - o(85, 80), gy, prog(lt, 0.5, 0.85), () => grandpa(0, 0, o(1.0, 1.0), t));
  popAt(cx + o(95, 90), gy, prog(lt, 0.7, 1.05), () => grandma(0, 0, o(0.98, 0.98), t));
  for (let i = 0; i < 5; i++) {   // 하트가 둥실
    const at = 1.2 + i * 0.55, k = prog(lt, at, at + 2.2);
    if (k <= 0 || k >= 1) continue;
    ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI);
    heart(cx + (hash(i * 4) - 0.5) * 200 + Math.sin(k * 6 + i) * 14, gy - o(380, 400) - k * o(220, 260), 0.8 + hash(i) * 0.6, i % 2 ? C.red : C.pink);
    ctx.restore();
  }
  polaroid(IMG.farmer, W * o(0.53, 0.5), H * o(0.43, 0.515), o(320, 410), o(440, 550), -0.045, prog(lt, 0.35, 0.75), 51, { fy: 0.28, cap: '포천 숲속우산 농원', capSize: o(28, 34) });
  blurOut(lt, 5.1, () => {
    const x = o(110, 80), y0 = o(300, 440), fb = { fam: FONT.title, size: o(92, 92), color: C.ink };
    if (V) {
      const e = typeText('웃으며 키운 버섯,', W / 2, y0, lt, 0.6, { ...fb, align: 'center' });
      typeText('건강하게 자랐어요.', W / 2, y0 + 110, lt, e, { ...fb, align: 'center', color: C.teal });
      typeText('노부부가 하루하루 정성껏 돌봅니다.', W / 2, y0 + 190, lt, e + 0.8, { fam: FONT.body, size: 42, align: 'center', color: C.ink2, rate: 0.035 });
    } else {
      const e = typeText('웃으며 키운 버섯,', x, y0, lt, 0.6, fb);
      typeText('건강하게 자랐어요.', x, y0 + 112, lt, e, { ...fb, color: C.teal });
      typeText('노부부가 하루하루', x + 2, y0 + 200, lt, e + 0.8, { fam: FONT.body, size: 40, color: C.ink2, rate: 0.035 });
      typeText('정성껏 돌봅니다.', x + 2, y0 + 256, lt, e + 1.4, { fam: FONT.body, size: 40, color: C.ink2, rate: 0.035 });
    }
  });
}
// 9-6. 고객 후기
function sReview(lt, t) {
  cream();
  if (V) polaroid(IMG.dish, 540, 600, 860, 484, -0.025, prog(lt, 0.15, 0.55), 61);
  else polaroid(IMG.dish, 560, 520, 720, 405, -0.03, prog(lt, 0.15, 0.55), 61);
  const x = o(1000, 90), y = o(300, 1010), w = o(820, 900), h = o(470, 480);
  popAt(x + w / 2, y + h / 2, prog(lt, 0.4, 0.75), () => {
    roughRect(-w / 2, -h / 2, w, h, 63, 2.2, 18); paper('#FBFAF6', 1.2, 7);
    ctx.beginPath(); ctx.moveTo(V ? -60 : -w / 2 + 6, V ? -h / 2 + 4 : 40); ctx.lineTo(V ? -20 : -w / 2 - 40, V ? -h / 2 - 50 : 70); ctx.lineTo(V ? 20 : -w / 2 + 6, V ? -h / 2 + 4 : 100); ctx.closePath(); ctx.fillStyle = '#FBFAF6'; ctx.fill();
  }, 0.04);
  popAt(x + o(130, 140), y + o(62, 66), prog(lt, 0.7, 1.0), () => { roughRect(-o(95, 105), -28, o(190, 210), 56, 64, 1.4, 12); paper(C.teal, 0.8, 3); text('고객 후기', 0, 12, { fam: FONT.title, size: o(32, 36), align: 'center', color: '#fff' }); });
  text('“', x + o(40, 44), y + o(210, 230), { fam: FONT.serif, weight: 700, size: o(120, 130), color: C.hl, alpha: prog(lt, 0.8, 1.1) });
  let e = 0.95;
  COPY.review.forEach((s, i) => { e = typeText(s, x + o(70, 76), y + o(190, 210) + i * o(86, 96), lt, e + 0.04, { fam: FONT.title, size: o(62, 70), color: C.ink }); });
  [[0.92, 0.08], [0.06, 0.93]].forEach(([fx, fy], i) => sparkle(x + w * fx, y + h * fy, 20, prog(lt, 2.4 + i * 0.3, 3.2 + i * 0.3), i ? C.yellow : C.teal));
}
// 9-7. 약도 + 주소
function mapCard(x, y, w, h, lt) {
  popAt(x + w / 2, y + h / 2, prog(lt, 0.1, 0.45), () => {
    ctx.translate(-w / 2, -h / 2);
    roughRect(0, 0, w, h, 71, 2.4, 18); paper('#F6F5EF', 1.2, 7);
    ctx.save(); roughRect(0, 0, w, h, 71, 2.4, 18); ctx.clip();
    const P = (fx, fy) => [fx * w, fy * h];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const draw = (pts, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([fx, fy], i) => { const [px, py] = P(fx, fy); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); };
    ctx.fillStyle = 'rgba(160,200,150,0.25)'; ctx.beginPath(); ctx.ellipse(w * 0.12, h * 0.9, w * 0.2, h * 0.16, 0, 0, TAU); ctx.fill();
    // 추동천 (하천)
    draw([[0.04, 0.33], [0.14, 0.31], [0.25, 0.36], [0.31, 0.47], [0.38, 0.62], [0.47, 0.8], [0.56, 0.84], [0.66, 0.74], [0.73, 0.55], [0.76, 0.32], [0.79, 0.0]], '#9BCFE8', o(12, 12));
    // 큰 도로
    draw([[0.2, -0.02], [0.27, 0.12], [0.33, 0.33], [0.4, 0.56], [0.5, 0.76], [0.56, 0.92], [0.6, 1.04]], '#F5D88A', o(16, 16));
    // 작은 길
    [[[0.38, 0.32], [0.5, 0.31], [0.56, 0.4], [0.54, 0.5], [0.47, 0.62]], [[0.56, 0.46], [0.66, 0.4], [0.72, 0.35], [0.8, 0.28], [0.9, 0.35], [1.02, 0.6]], [[0.72, 0.35], [0.74, 0.2], [0.78, 0.08]], [[0.42, 0.5], [0.3, 0.6], [0.22, 0.7]], [[0.82, 0.3], [0.86, 0.5], [0.92, 0.75], [0.96, 1.02]]].forEach(r => draw(r, '#FFFFFF', o(8, 8)));
    ctx.restore();
    const lab = (s, fx, fy, col = C.muted) => text(s, fx * w, fy * h, { fam: FONT.body, size: o(22, 24), align: 'center', color: col, alpha: prog(lt, 0.5, 0.8) });
    lab('추동3리 마을회관', 0.66, 0.56); lab('창수면사무소', 0.84, 0.25); lab('추동천', 0.5, 0.9, '#5A9CBD'); lab('추동2리회관', 0.41, 0.78);
    const [px, py] = P(0.55, 0.5);
    const pr = prog(lt, 0.7, 1.6); if (pr > 0 && pr < 1) { ctx.save(); ctx.globalAlpha = 1 - pr; ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(px, py, 20 + pr * 70, (20 + pr * 70) * 0.4, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    pin(px, py, o(1.05, 1.1), prog(lt, 0.45, 0.8));
    popAt(px, py + o(48, 52), prog(lt, 0.75, 1.0), () => { roughRect(-o(150, 165), -26, o(300, 330), 52, 72, 1.4, 12); paper('#FFFFFF', 0.9, 3); text('숲속우산 참송이버섯', 0, 11, { fam: FONT.title, size: o(30, 33), align: 'center', color: C.ink }); });
  }, 0.03);
}
function sMap(lt, t) {
  cream();
  if (V) mapCard(60, 230, 960, 780, lt); else mapCard(100, 150, 900, 780, lt);
  const x = o(1090, 90), y0 = o(250, 1130);
  typeText(COPY.farm, x, y0, lt, 0.5, { fam: FONT.title, size: o(70, 76), color: C.ink });
  const rows = [['pin', C.red, COPY.addr, null], ['park', C.navy, COPY.park, null], ['bus', C.teal, COPY.bus1, COPY.bus2]];
  rows.forEach(([kind, col, s1, s2], i) => {
    const y = y0 + o(120, 130) + i * o(150, 165), at = 1.0 + i * 0.55;
    infoIcon(x + 30, y - 12, kind, col, prog(lt, at, at + 0.3));
    const e = typeText(s1, x + 82, y, lt, at + 0.15, { fam: FONT.body, size: o(38, 42), color: C.ink, rate: 0.03 });
    if (s2) typeText(s2, x + 82, y + o(54, 58), lt, e, { fam: FONT.body, size: o(34, 38), color: C.ink2, rate: 0.03 });
  });
}
// 9-8. 마무리
function sEnd(lt, t) {
  cream();
  const cy = o(330, 700);
  logoMark(W / 2, cy, o(1.15, 1.35), prog(lt, 0.15, 0.55));
  typeText(COPY.brand, W / 2, cy + o(250, 300), lt, 0.6, { fam: FONT.title, size: o(104, 108), align: 'center', color: C.ink });
  typeText(COPY.en, W / 2, cy + o(320, 375), lt, 1.6, { fam: FONT.serif, weight: 700, size: o(36, 38), align: 'center', color: C.teal, italic: true, rate: 0.03 });
  popAt(W / 2, cy + o(430, 500), prog(lt, 2.1, 2.45), () => {
    const ft = { fam: FONT.title, size: o(56, 64), color: '#fff' }, tw = measure(COPY.tel, ft), gap = o(70, 78);
    const pw = tw + gap + o(80, 90), ph = o(92, 104), x0 = -pw / 2 + o(40, 45);
    roughRect(-pw / 2, -ph / 2, pw, ph, 81, 1.8, 14); paper(C.navy, 1, 5);
    phoneGlyph(x0 + o(18, 20), 0, o(1.3, 1.45), '#fff');
    text(COPY.tel, x0 + gap, o(19, 22), ft);
  });
  typeText(COPY.addr, W / 2, cy + o(540, 625), lt, 2.6, { fam: FONT.body, size: o(34, 40), align: 'center', color: C.ink2, rate: 0.03 });
  confetti(t, lt, V ? [[160, 420, 't', C.red, 0.3], [930, 470, 'd', C.yellow, 0.5], [120, 1480, 's', C.teal, 0.9], [950, 1520, 'd', C.green, 1.1], [300, 1640, 'd', C.pink, 1.3], [800, 1680, 't', C.navy, 1.5]]
                    : [[520, 150, 't', C.red, 0.3], [1400, 190, 'd', C.yellow, 0.5], [380, 760, 's', C.teal, 0.9], [1540, 720, 'd', C.green, 1.1], [600, 960, 'd', C.pink, 1.3], [1320, 980, 't', C.navy, 1.5]]);
}
const SCENES = [[T.hook, sHook], [T.land, sLand], [T.c1, sCards('c1')], [T.c2, sCards('c2')], [T.c3, sCards('c3')], [T.c4, sCards('c4')],
  [T.circle, sCircle], [T.couple, sCouple], [T.review, sReview], [T.map, sMap], [T.end, sEnd]];
const sceneAt = key => SCENES.find(([r]) => r === T[key])[1];

/* ---------- 10. 전환 (레퍼런스: 종이 찢김 · 종이 한 장이 덮기) ---------- */
// 위에서부터 종이가 찢기며 다음 장면이 드러난다
function tearIn(t, a, d, nextKey) {
  const k = prog(t, a, a + d);
  if (k <= 0 || k >= 1) return;
  const ty = eInOutCubic(k) * (H + 80) - 40, fn = sceneAt(nextKey), lt = t - T[nextKey][0];
  const edge = x => ty + Math.sin(x * 0.013 + 1) * 10 + (hash(Math.floor(x / 9)) - 0.5) * 16;
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0);
  for (let x = W; x >= 0; x -= 9) ctx.lineTo(x, edge(x));
  ctx.closePath(); ctx.clip(); fn(lt, t); ctx.restore();
  // 찢긴 흰 섬유 가장자리 + 그림자
  ctx.save(); ctx.beginPath();
  for (let x = 0; x <= W; x += 9) ctx.lineTo(x, edge(x));
  for (let x = W; x >= 0; x -= 9) ctx.lineTo(x, edge(x) + 8 + hash(x * 0.7) * 6);
  ctx.closePath(); ctx.shadowColor = 'rgba(40,35,25,0.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FAF8F2'; ctx.fill(); ctx.restore();
}
// 종이 한 장이 미끄러져 덮는다 (dir: 'l' 왼쪽에서, 'r' 오른쪽에서, 'u' 아래에서, 'd' 위에서)
function sheetIn(t, a, d, nextKey, dir) {
  const k = prog(t, a, a + d);
  if (k <= 0 || k >= 1) return;
  const e = eInOutCubic(k), fn = sceneAt(nextKey), lt = t - T[nextKey][0];
  let x = 0, y = 0;
  if (dir === 'r') x = (1 - e) * W; else if (dir === 'l') x = -(1 - e) * W; else if (dir === 'u') y = (1 - e) * H; else y = -(1 - e) * H;
  ctx.save();
  ctx.shadowColor = 'rgba(40,35,25,0.38)'; ctx.shadowBlur = 26; ctx.shadowOffsetX = dir === 'r' ? -8 : dir === 'l' ? 8 : 0; ctx.shadowOffsetY = dir === 'u' ? -8 : dir === 'd' ? 8 : 0;
  ctx.fillStyle = C.paper; ctx.fillRect(x, y, W, H); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, W, H); ctx.clip(); ctx.translate(x, y); fn(lt, t); ctx.restore();
}

/* ---------- 11. 한 프레임 ---------- */
function render(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  for (const [[a, b], fn] of SCENES) if (t >= a && t < b) { fn(t - a, t, b - a); break; }
  tearIn(t, T.land[0] - 0.55, 0.65, 'land');
  sheetIn(t, T.circle[0] - 0.45, 0.5, 'circle', 'r');
  sheetIn(t, T.couple[0] - 0.45, 0.5, 'couple', 'u');
  sheetIn(t, T.review[0] - 0.45, 0.5, 'review', 'l');
  sheetIn(t, T.map[0] - 0.45, 0.5, 'map', 'r');
  sheetIn(t, T.end[0] - 0.45, 0.5, 'end', 'd');
  paperOverlay(0.42);
  if (t < 0.35) { ctx.fillStyle = `rgba(239,235,226,${1 - t / 0.35})`; ctx.fillRect(0, 0, W, H); }
  if (t > DUR - 0.5) { ctx.fillStyle = `rgba(239,235,226,${(t - DUR + 0.5) / 0.5})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- 12. 재생 / 렌더 훅 ---------- */
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
if (RENDER) document.body.classList.add('render');
else cv.style.aspectRatio = `${W} / ${H}`;
window.DURATION = DUR;
window.FPS = FPS;
window.renderFrame = t => render(t);
window.captureFrame = t => { render(t); return cv.toDataURL('image/jpeg', 0.93); };

async function boot() {
  await Promise.all([document.fonts.load('400 40px Jua', '가A'), document.fonts.load('400 40px Dodum', '가A'), document.fonts.load('700 40px Batang', 'Aa1'), document.fonts.load('600 40px Pre', 'A')]);
  buildPaper();
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
