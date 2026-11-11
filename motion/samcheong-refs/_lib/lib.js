/* 삼청동수제비 레퍼런스 영상 9편이 함께 쓰는 도구.
   영상 파일(index.html)이 먼저 window.CONF = {w, h, dur} 를 정하고, render(t) 를 만든다.
   모든 그림은 시간 t 만으로 정해진다(여러 탭이 나눠 그려도 같은 그림). */
const CONF = window.CONF || {};
const W = CONF.w || 1920, H = CONF.h || 1080, FPS = CONF.fps || 30, DUR = CONF.dur || 15;
const V = H > W;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* ---------- 수학 · 움직임 ---------- */
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
const eOutCubic = k => 1 - Math.pow(1 - clamp(k), 3);
const eOutQuart = k => 1 - Math.pow(1 - clamp(k), 4);
const eOutExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(k)));
const eInCubic = k => clamp(k) ** 3;
const eInOutCubic = k => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const eInOutQuint = k => { k = clamp(k); return k < 0.5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2; };
const eOutBack = (k, s = 1.70158) => { k = clamp(k) - 1; return k * k * ((s + 1) * k + s) + 1; };
const eOutElastic = k => { k = clamp(k); return k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (TAU / 3)) + 1; };
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const inT = (t, a, b) => t >= a && t < b;

/* ---------- 글자 ---------- */
const FAM = { pre: 'Pre, NotoKR', black: 'NotoKR, Pre', serif: 'Batang, NotoKR', brush: 'Brush', mono: 'Mono, Pre' };
function setFont(o, g = ctx) {
  g.font = `${o.weight ?? 700} ${o.size ?? 48}px ${o.fam ?? FAM.pre}`;
  g.textAlign = o.align ?? 'left'; g.textBaseline = o.base ?? 'alphabetic';
  g.letterSpacing = (o.ls ?? 0) + 'px';
}
function text(s, x, y, o = {}, g = ctx) {
  if (!s) return;
  g.save(); setFont(o, g);
  g.globalAlpha *= clamp(o.alpha ?? 1);
  if (o.blur > 0.3) g.filter = `blur(${o.blur.toFixed(1)}px)`;
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = o.shadowBlur ?? 24; }
  if (o.stroke) { g.lineWidth = o.strokeW ?? 2; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  if (o.color !== 'none') { g.fillStyle = o.color ?? '#fff'; g.fillText(s, x, y); }
  g.restore();
}
function measure(s, o, g = ctx) { g.save(); setFont(o, g); const w = g.measureText(s).width; g.restore(); return w; }
function fit(s, o, maxW, g = ctx) { const w = measure(s, o, g); return w > maxW ? { ...o, size: o.size * maxW / w } : o; }
// 글자가 아래에서 올라오며 흐림이 걷힌다 (k: 0→1)
function riseText(s, x, y, k, o = {}) {
  k = clamp(k); if (k <= 0) return;
  const e = eOutCubic(k);
  text(s, x, y + (1 - e) * (o.dy ?? 40), { ...o, alpha: (o.alpha ?? 1) * clamp(k * 1.6), blur: (1 - e) * (o.blurAmt ?? 12) });
}
// 글자 하나씩 (k: 0→1)
function staggerText(s, x, y, k, o = {}) {
  const chars = [...s], n = chars.length; if (!n) return;
  const total = measure(s, o);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const step = o.step ?? 0.5;
  chars.forEach((c, i) => {
    const kk = clamp(k * (1 + step * (n - 1)) - i * step);
    const w = measure(c, { ...o, align: 'left' });
    riseText(c, cx, y, kk, { ...o, align: 'left' });
    cx += w + (o.ls ?? 0);
  });
}
function typed(s, k) { const c = [...s]; return c.slice(0, Math.round(c.length * clamp(k))).join(''); }
function caret(x, y, size, t, color = '#fff') { if (Math.floor(t * 2.4) % 2) return; ctx.fillStyle = color; ctx.fillRect(x + 4, y - size * 0.8, Math.max(2, size * 0.06), size * 0.95); }

/* ---------- 도형 ---------- */
function rr(x, y, w, h, r, g = ctx) { g.beginPath(); g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2)); }
function fillRR(x, y, w, h, r, fill, g = ctx) { rr(x, y, w, h, r, g); g.fillStyle = fill; g.fill(); }
function shadowed(fn, color = 'rgba(0,0,0,0.45)', blur = 40, dy = 18, g = ctx) { g.save(); g.shadowColor = color; g.shadowBlur = blur; g.shadowOffsetY = dy; fn(); g.restore(); }

/* ---------- 사진 ---------- */
const IMG = {};
const PHOTO_KEYS = ['pot', 'spoon', 'jeon', 'jjuk', 'kimchi', 'store', 'map'];
function loadImage(key, src) { return new Promise(res => { const im = new Image(); im.onload = () => { IMG[key] = im; res(im); }; im.onerror = () => res(null); im.src = src; }); }
// 사진을 상자에 꽉 차게(넘치는 부분 자르기). fx, fy: 보이는 중심(0~1), z: 확대
function cover(img, x, y, w, h, z = 1, fx = 0.5, fy = 0.5, g = ctx) {
  if (!img) { g.fillStyle = '#3a2a1c'; g.fillRect(x, y, w, h); return; }
  const sc = Math.max(w / img.width, h / img.height) * z, dw = img.width * sc, dh = img.height * sc;
  const dx = clamp(x + w / 2 - fx * dw, x + w - dw, x), dy = clamp(y + h / 2 - fy * dh, y + h - dh, y);
  g.drawImage(img, dx, dy, dw, dh);
}
function photoCard(img, cx, cy, w, h, o = {}) {
  ctx.save();
  ctx.globalAlpha *= clamp(o.alpha ?? 1);
  ctx.translate(cx, cy); ctx.rotate(o.rot ?? 0); ctx.scale(o.s ?? 1, o.s ?? 1);
  if (o.shadow !== false) shadowed(() => fillRR(-w / 2, -h / 2, w, h, o.r ?? 24, o.frame ?? '#000'), o.shadowColor ?? 'rgba(0,0,0,0.5)', o.shadowBlur ?? 50, o.shadowDy ?? 22);
  if (o.border) fillRR(-w / 2 - o.border, -h / 2 - o.border, w + o.border * 2, h + o.border * 2, (o.r ?? 24) + o.border, o.borderColor ?? '#fff');
  rr(-w / 2, -h / 2, w, h, o.r ?? 24); ctx.clip();
  if (o.filter) ctx.filter = o.filter;
  cover(img, -w / 2, -h / 2, w, h, o.z ?? 1, o.fx ?? 0.5, o.fy ?? 0.5);
  ctx.filter = 'none';
  if (o.after) o.after(w, h);
  ctx.restore();
}

/* ---------- 휴대폰 ---------- */
const PW = 390, PH = 844, PR = 1.6;
const PHONE = mk(Math.round(PW * PR), Math.round(PH * PR)), PG = PHONE.getContext('2d');
// screenFn(g) 은 390×844 좌표로 그린다
function phone(cx, cy, s, screenFn, o = {}) {
  PG.setTransform(1, 0, 0, 1, 0, 0); PG.clearRect(0, 0, PHONE.width, PHONE.height);
  PG.save(); PG.scale(PR, PR); rr(0, 0, PW, PH, 52, PG); PG.clip(); screenFn(PG); PG.restore();
  ctx.save();
  ctx.globalAlpha *= clamp(o.alpha ?? 1);
  ctx.translate(cx, cy); ctx.rotate(o.rot ?? 0); ctx.scale(s, s);
  const bw = 14;
  shadowed(() => fillRR(-PW / 2 - bw, -PH / 2 - bw, PW + bw * 2, PH + bw * 2, 66, o.body ?? '#0d0d10'), o.shadowColor ?? 'rgba(0,0,0,0.55)', 80, 40);
  const gr = ctx.createLinearGradient(-PW / 2, -PH / 2, PW / 2, PH / 2); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.02)'); gr.addColorStop(1, 'rgba(255,255,255,0.12)');
  rr(-PW / 2 - bw, -PH / 2 - bw, PW + bw * 2, PH + bw * 2, 66); ctx.strokeStyle = gr; ctx.lineWidth = 3; ctx.stroke();
  ctx.drawImage(PHONE, -PW / 2, -PH / 2, PW, PH);
  fillRR(-60, -PH / 2 + 12, 120, 34, 17, '#000');   // 카메라 섬
  if (o.glare !== false) {
    ctx.save(); rr(-PW / 2, -PH / 2, PW, PH, 52); ctx.clip();
    const g2 = ctx.createLinearGradient(-PW, -PH / 2, PW, PH / 2); g2.addColorStop(0.35, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.07)'); g2.addColorStop(0.65, 'rgba(255,255,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(-PW / 2, -PH / 2, PW, PH); ctx.restore();
  }
  ctx.restore();
}
function statusBar(g, dark = true) {
  const c = dark ? '#111' : '#fff';
  text('11:30', 34, 34, { weight: 700, size: 16, color: c }, g);
  g.fillStyle = c; [0, 1, 2, 3].forEach(i => g.fillRect(PW - 92 + i * 6, 30 - i * 3, 4, 4 + i * 3)); fillRR(PW - 62, 21, 26, 13, 4, c, g);
}

/* ---------- 유리 카드 ---------- */
function glass(x, y, w, h, r = 24, o = {}) {
  ctx.save();
  ctx.globalAlpha *= clamp(o.alpha ?? 1);
  if (o.shadow !== false) shadowed(() => fillRR(x, y, w, h, r, o.fill ?? 'rgba(255,255,255,0.10)'), o.shadowColor ?? 'rgba(0,0,0,0.35)', 40, 18);
  else fillRR(x, y, w, h, r, o.fill ?? 'rgba(255,255,255,0.10)');
  const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, o.edge1 ?? 'rgba(255,255,255,0.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, o.edge2 ?? 'rgba(255,255,255,0.3)');
  rr(x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = gr; ctx.lineWidth = o.lw ?? 1.5; ctx.stroke();
  const hi = ctx.createLinearGradient(x, y, x, y + h * 0.5); hi.addColorStop(0, 'rgba(255,255,255,0.16)'); hi.addColorStop(1, 'rgba(255,255,255,0)');
  rr(x, y, w, h, r); ctx.fillStyle = hi; ctx.fill();
  if (o.content) { rr(x, y, w, h, r); ctx.clip(); o.content(x, y, w, h); }
  ctx.restore();
}

/* ---------- 배경 · 질감 ---------- */
let NOISE = null;
function buildNoise() { NOISE = mk(256, 256); const g = NOISE.getContext('2d'), d = g.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
function grain(t, alpha = 0.05, mode = 'overlay') {
  if (!NOISE) return;
  const f = Math.floor(t * FPS / 2);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = mode;
  ctx.translate(-(hash(f) * 256), -(hash(f + 9) * 256)); ctx.fillStyle = ctx.createPattern(NOISE, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
function vignette(s = 0.45, color = '0,0,0') {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${s})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function glow(x, y, r, color, a = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
function sunburst(cx, cy, n, c1, c2, rot = 0, R = Math.max(W, H) * 1.2) {
  ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = c2;
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, b = a + TAU / n / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.lineTo(Math.cos(b) * R, Math.sin(b) * R); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function confetti(t, t0, cx, cy, n, colors, o = {}) {
  const lt = t - t0; if (lt < 0 || lt > (o.life ?? 2.2)) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i * 3.1) * TAU, sp = (o.speed ?? 900) * (0.35 + hash(i * 7.7)), g = o.grav ?? 900;
    const x = cx + Math.cos(a) * sp * lt * (1 - lt * 0.25), y = cy + Math.sin(a) * sp * lt * 0.75 + g * lt * lt * 0.5;
    const s = (o.size ?? 12) * (0.6 + hash(i * 1.7)), r = lt * (4 + hash(i) * 8) + i;
    ctx.save(); ctx.globalAlpha = clamp(1 - lt / (o.life ?? 2.2)) ; ctx.translate(x, y); ctx.rotate(r); ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-s / 2, -s / 4, s, s / 2 * (0.4 + Math.abs(Math.sin(r * 2)))); ctx.restore();
  }
}
function flashAt(t, at, color = '#fff', peak = 0.8, d = 0.25) { const a = 1 - clamp(Math.abs(t - at) / d); if (a > 0) { ctx.save(); ctx.globalAlpha = peak * a * a; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
// 김 (그릇 위로 오르는 하얀 줄기)
function steam(cx, cy, w, h, t, n = 5, a = 0.5) {
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.35 + hash(i)) % 1, x0 = cx + (hash(i * 5) - 0.5) * w, y0 = cy - ph * h;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10 + hash(i) * 14; ctx.filter = 'blur(10px)';
    ctx.beginPath(); ctx.moveTo(x0, y0); for (let j = 1; j < 6; j++) ctx.lineTo(x0 + Math.sin(j * 1.3 + t * 1.5 + i) * 18, y0 - j * h * 0.06); ctx.stroke();
  }
  ctx.restore();
}
// 김 오르는 그릇 아이콘 (로고 표시)
function bowlIcon(cx, cy, s, color, lw = 6, g = ctx) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-46, 0); g.quadraticCurveTo(0, 62, 46, 0); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(-54, 0); g.lineTo(54, 0); g.stroke();
  g.beginPath(); g.moveTo(-14, 34); g.lineTo(14, 34); g.stroke();
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 18, -10); g.bezierCurveTo(i * 18 - 10, -26, i * 18 + 10, -38, i * 18, -54); g.stroke(); }
  g.restore();
}

/* ---------- 가게 자료 (사용자가 준 사진 · 리뷰 · 소개글 · 지도 · 매장 정보에서만) ---------- */
const SJ = {
  brand: '삼청동수제비', badge: '미슐랭 맛집', area: '북촌 · 삼청동', tag: 'SAMCHEONG SUJEBI',
  addr: '서울 종로구 삼청로 101-1', addr1: '서울 종로구', addr2: '삼청로 101-1', subway: '지하철 3호선 안국역 1번 출구', tel: '02-735-2965', close: '20:00 영업 종료',
  intro: ['엄선된 재료,', '편안한 분위기,', '푸짐한 인심.'], mom: '어머니가 만들어주신 맛 그대로',
  menu: [['수제비', '멸치 육수 · 얇은 반죽', 'spoon'], ['감자전', '노릇노릇 · 바삭하게', 'jeon'], ['쭈꾸미', '입속에서 살살 · 별미', 'jjuk'], ['항아리 수제비', '옹기에 가득', 'pot'], ['김치', '수제비와 함께', 'kimchi']],
  ingredients: ['바지락', '호박', '부추', '당근', '김가루'],
  reviews: [
    '수제비 국물 미쳤어요~~',
    '줄 서는데 충분한 명분이 있다!!',
    '감자전 진짜 최고~~!!!',
    '“명불허전” 수제비 국물 끝내주고 김치도 맛있었어요~',
    '멸치 육수가 깊고 진한 수제비는 쫄깃한 식감이 아주 예술이었어요.',
    '양도 항아리 가득 나오고 혼자 이걸 어케 다 먹지 했는데 깨끗하게 비웠음:)',
    '다음에 또 재방문해서 먹을 생각입니다',
    '노릇노릇하고 바삭하게 구워진 감자전도 곁들여 먹기 딱 좋았답니다.',
  ],
};

/* ---------- 시작 ---------- */
async function loadFonts() {
  const L = [['Pre', 'Pretendard-Medium.otf', '500'], ['Pre', 'Pretendard-SemiBold.otf', '600'], ['Pre', 'Pretendard-Bold.otf', '700'], ['Pre', 'Pretendard-ExtraBold.otf', '800'],
    ['NotoKR', 'NotoSansKR-Black.ttf', '900'], ['Batang', 'GowunBatang-700.ttf', '700'], ['Brush', 'NanumBrushScript-400.ttf', '400'], ['Mono', 'JetBrainsMono-Regular.ttf', '400']];
  await Promise.all(L.map(async ([fam, file, w]) => {
    for (let i = 0; i < 4; i++) {
      try { const f = new FontFace(fam, `url(../_lib/fonts/${file})`, { weight: w }); await f.load(); document.fonts.add(f); return; } catch (e) { await new Promise(r => setTimeout(r, 300)); }
    }
  }));
}
async function boot() {
  buildNoise();
  await Promise.all([loadFonts(), ...PHOTO_KEYS.map(k => loadImage(k, `../_lib/assets/${k}.${k === 'map' ? 'png' : 'jpg'}`))]);
  if (window.EXTRA_BOOT) await window.EXTRA_BOOT();
  window.sceneReady = true;
  if (!/render=1/.test(location.search)) {   // 미리보기: 반복 재생
    const t0 = performance.now();
    (function loop() { window.render(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); })();
  }
}
window.DURATION = DUR; window.FPS = FPS;
window.captureFrame = t => { window.render(clamp(t, 0, DUR - 1e-6)); return cv.toDataURL('image/jpeg', 0.93); };
window.addEventListener('load', boot);
