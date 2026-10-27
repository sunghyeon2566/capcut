/* 서울 시정 홍보 — CSS 3D 장면 라이브러리
 * 바닥 좌표계: x 오른쪽, y 앞(화면 아래쪽), z 위. 단위 px, 원점은 장면 중앙.
 * 보이는 면: 윗면(top), 앞면(+y), 왼쪽면(-x)
 */
(function () {
  "use strict";

  function rgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // f > 0 밝게, f < 0 어둡게
  function shade(c, f) {
    if (!c.startsWith("#")) return c;
    const [r, g, b] = rgb(c);
    const t = f < 0 ? 0 : 255, p = Math.abs(f);
    const m = (v) => Math.round((t - v) * p + v);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }

  function face(w, h, bg, tf, inner, cls) {
    return `<div class="f ${cls || ""}" style="width:${w}px;height:${h}px;background:${bg};transform:${tf}">${inner || ""}</div>`;
  }

  // 직육면체 (x, y 는 밑면 중심)
  function box(o) {
    const { x = 0, y = 0, z = 0, w, l, h, c } = o;
    const top = o.topBg || c;
    const left = o.leftBg || shade(c, -0.12);
    const front = o.frontBg || shade(c, -0.26);
    let s = `<div class="obj ${o.cls || ""}" style="transform:translate3d(${x - w / 2}px,${y - l / 2}px,${z}px)">`;
    s += face(l, h, left, `translateZ(${h}px) rotateZ(90deg) rotateX(-90deg)`, o.left, "fl");
    s += face(w, h, front, `translate3d(0,${l}px,${h}px) rotateX(-90deg)`, o.front, "ff");
    s += face(w, l, top, `translateZ(${h}px)`, o.top, "ft" + (o.round ? " rnd" : ""));
    return s + "</div>";
  }

  // 원기둥 (x, y 는 밑면 중심)
  function cyl(o) {
    const { x = 0, y = 0, z = 0, r, h, c, n = 18 } = o;
    const fw = 2 * r * Math.tan(Math.PI / n) + 0.8;
    let s = `<div class="obj" style="transform:translate3d(${x}px,${y}px,${z}px)">`;
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      // 바깥 방향 법선과 빛(왼쪽 앞) 의 내적으로 명암
      const rad = (a * Math.PI) / 180;
      const nx = -Math.sin(rad), ny = Math.cos(rad);
      const lit = nx * -0.55 + ny * 0.83;
      s += face(fw, h, shade(c, -0.32 + lit * 0.2), `rotateZ(${a}deg) translate3d(${-fw / 2}px,${r}px,${h}px) rotateX(-90deg)`, "", "cy");
    }
    s += `<div class="f disk" style="width:${2 * r}px;height:${2 * r}px;background:${o.topBg || c};transform:translate3d(${-r}px,${-r}px,${h}px)">${o.top || ""}</div>`;
    return s + "</div>";
  }

  // 화면을 정면으로 바라보는 요소 (x, y, z 는 아래 중앙 기준점)
  function bb(x, y, z, html, cls) {
    return `<div class="obj" style="transform:translate3d(${x}px,${y}px,${z}px)"><div class="bb"><div class="bbi ${cls || ""}">${html}</div></div></div>`;
  }

  // 두께가 있는 입체 아이콘/글자 (겹겹이 쌓아 돌출 효과)
  function ext(x, y, z, html, o) {
    o = o || {};
    const depth = o.depth || 14, step = 2, col = o.color || "#1E5BD8";
    let layers = "";
    for (let i = depth; i >= 0; i -= step) {
      const isFront = i === 0;
      layers += `<div class="exl" style="transform:translateZ(${-i}px);color:${isFront ? col : shade(col, -0.45)}">${html}</div>`;
    }
    return `<div class="obj" style="transform:translate3d(${x}px,${y}px,${z}px)"><div class="bb"><div class="bbi"><div class="ext ${o.cls || ""}" style="transform:rotateY(${o.ry == null ? -24 : o.ry}deg)">${layers}</div></div></div></div>`;
  }

  // 바닥 그림자
  function shadow(x, y, w, l, a) {
    return `<div class="obj" style="transform:translate3d(${x - w / 2}px,${y - l / 2}px,0.5px)"><div class="f shd" style="width:${w}px;height:${l}px;opacity:${a == null ? 0.35 : a}"></div></div>`;
  }

  // 바닥판
  function plate(w, l, c, o) {
    o = o || {};
    return box({ x: o.x || 0, y: o.y || 0, z: -(o.h || 16), w, l, h: o.h || 16, c, top: o.top, round: o.round, topBg: o.topBg });
  }

  function tree(x, y, s, c) {
    s = s || 1;
    return cyl({ x, y, r: 5 * s, h: 26 * s, c: "#8B5E3C", n: 8 }) +
      bb(x, y, 18 * s, `<div class="ball" style="width:${46 * s}px;height:${46 * s}px;--c:${c || "#2FBF71"}"></div>`);
  }

  function building(x, y, w, l, h, c, o) {
    o = o || {};
    const win = `<div class="win"></div>`;
    return box({ x, y, w, l, h, c, front: win, left: win, top: o.top, z: o.z || 0 });
  }

  const W = (inner, o) => {
    o = o || {};
    return `<div class="scene3d ${o.dark ? "dark" : ""}"><div class="world" style="--s:${o.scale || 1}">${inner}</div></div>`;
  };

  const C = {
    blue: "#1E5BD8", navy: "#16307A", sky: "#7FB2FF", orange: "#FF8A3D", green: "#20B486",
    yellow: "#FFD54A", purple: "#7B5CFF", red: "#FF5A6E", gray: "#E6ECF7", white: "#FFFFFF",
  };

  const scenes = {};

  function skyline(extra) {
    let s = plate(500, 440, "#DDE7FA", { topBg: "linear-gradient(135deg,#EAF1FF,#D6E3FB)" });
    // 한강
    s += box({ x: 0, y: 70, z: 0, w: 500, l: 74, h: 3, c: "#4D8DFF", topBg: "linear-gradient(90deg,#5A9BFF,#3B7BEF,#6AA8FF)" });
    // 다리
    s += box({ x: -60, y: 70, z: 10, w: 16, l: 92, h: 6, c: "#FFFFFF" });
    s += box({ x: 120, y: 70, z: 10, w: 16, l: 92, h: 6, c: "#FFFFFF" });
    // 남산 + 서울타워
    s += box({ x: -150, y: -140, w: 150, l: 120, h: 30, c: "#38C47F" });
    s += box({ x: -150, y: -140, z: 30, w: 96, l: 76, h: 26, c: "#2FB070" });
    s += cyl({ x: -150, y: -140, z: 56, r: 7, h: 120, c: "#F2F5FB", n: 10 });
    s += cyl({ x: -150, y: -140, z: 150, r: 18, h: 16, c: "#FF8A3D", n: 14 });
    s += cyl({ x: -150, y: -140, z: 166, r: 3, h: 40, c: "#F2F5FB", n: 6 });
    // 도심 빌딩 (강 북쪽)
    const north = [[-40, -130, 46, 46, 150, C.blue], [20, -150, 40, 40, 110, "#3D74E8"], [80, -120, 50, 44, 180, C.navy],
      [140, -150, 40, 40, 96, "#5B8DF0"], [190, -110, 36, 36, 130, C.blue], [30, -70, 40, 40, 70, "#8DB6FF"],
      [-80, -60, 36, 36, 60, "#A9C6FF"], [150, -50, 40, 40, 80, "#6E9CF5"], [-200, -40, 40, 40, 50, "#A9C6FF"]];
    north.forEach((b) => (s += building(...b)));
    // 강 남쪽
    const south = [[-170, 160, 44, 44, 90, "#5B8DF0"], [-100, 170, 40, 40, 60, "#8DB6FF"], [60, 160, 46, 46, 120, C.blue],
      [130, 175, 40, 40, 70, "#A9C6FF"], [200, 160, 36, 36, 150, C.navy], [-20, 175, 36, 36, 48, "#8DB6FF"]];
    south.forEach((b) => (s += building(...b)));
    s += tree(-215, 110) + tree(-30, 125, 0.8) + tree(220, 115, 0.9) + tree(-120, -10, 0.8) + tree(90, 5, 0.8);
    return s + (extra || "");
  }

  scenes.skyline = () => W(skyline(bb(30, 40, 230, `<div class="tag big">SEOUL 2026</div>`, "float")), { scale: 0.92 });

  scenes.ending = () =>
    W(skyline(ext(20, 30, 210, heartSvg(), { color: C.red, depth: 16, cls: "float", ry: -20 }) +
      bb(-160, 120, 120, `<div class="emoji" style="font-size:44px">🎉</div>`, "float d2") +
      bb(190, -60, 230, `<div class="emoji" style="font-size:40px">✨</div>`, "float d3")), { scale: 0.92 });

  scenes.cubes = () => {
    const items = [["🚌", C.blue, -70, -70, 90], ["⌚", C.green, 70, -70, 130], ["🤝", C.orange, -70, 70, 60], ["🤖", C.purple, 70, 70, 110]];
    let s = plate(330, 330, "#E3EBFB", { topBg: "#EAF0FD" });
    items.forEach(([e, c, x, y, h], i) => {
      s += box({ x, y, w: 104, l: 104, h, c, top: `<div class="tnum">${i + 1}</div>` });
      s += bb(x, y, h + 18, `<div class="emoji">${e}</div>`, `float d${i}`);
    });
    return W(s, { scale: 1.05 });
  };

  scenes.bars = () => {
    const data = [["시민 생활", 32, C.blue], ["시설 개관", 17, C.green], ["행사·축제", 6, C.orange], ["규제 개선", 5, C.purple]];
    let s = plate(440, 280, "#E3EBFB", { topBg: "#EAF0FD" });
    data.forEach(([n, v, c], i) => {
      const x = -165 + i * 110, h = 24 + v * 7.2;
      s += box({ x, y: -20, w: 66, l: 66, h, c, top: `<div class="tnum sm">${v}</div>` });
      s += bb(x, 70, 0, `<div class="tag sm">${n}</div>`);
    });
    s += ext(90, -90, 250, `<span class="exnum">60</span>`, { color: C.blue, depth: 12, cls: "float" });
    s += bb(90, -90, 222, `<div class="tag sm">개 사업</div>`, "float");
    return W(s, { scale: 1 });
  };

  scenes.card = () => {
    let s = plate(380, 300, "#E3EBFB", { topBg: "#EAF0FD" });
    // 버스
    s += box({ x: -90, y: 60, w: 150, l: 60, h: 56, c: "#2E7BF6", front: `<div class="win bus"></div>`, left: `<div class="win bus"></div>` });
    s += cyl({ x: -40, y: 92, z: 0, r: 10, h: 4, c: "#222" });
    // 지하철
    s += box({ x: 100, y: -30, w: 70, l: 180, h: 52, c: "#20B486", front: `<div class="win bus"></div>`, left: `<div class="win bus"></div>` });
    s += shadow(0, -10, 260, 170, 0.25);
    s += box({ x: 0, y: -10, z: 150, w: 260, l: 164, h: 8, c: "#1E5BD8", cls: "float",
      topBg: "linear-gradient(135deg,#3D7BFF,#1E46B8 60%,#7B5CFF)",
      top: `<div class="cardface"><div class="chip"></div><div class="ct">기후동행패스</div><div class="cs">K-PASS · SEOUL</div></div>` });
    return W(s, { scale: 1 });
  };

  scenes.clock = () => {
    let s = plate(360, 300, "#E3EBFB", { topBg: "#EAF0FD" });
    s += cyl({ x: -30, y: -10, r: 112, h: 30, c: "#FFD54A", n: 24, topBg: "radial-gradient(circle,#FFF6CF,#FFE27A)",
      top: `<div class="dial"><svg viewBox="0 0 200 200" width="100%" height="100%"><circle cx="100" cy="100" r="92" fill="none" stroke="#E0B300" stroke-width="6"/>${Array.from({ length: 12 }, (_, i) => `<line x1="100" y1="16" x2="100" y2="${i % 3 ? 26 : 34}" stroke="#7A5B00" stroke-width="${i % 3 ? 3 : 6}" transform="rotate(${i * 30} 100 100)"/>`).join("")}<path d="M100 100 L100 8 A92 92 0 0 1 179.7 54 Z" fill="#FF8A3D" opacity=".55"/><line x1="100" y1="100" x2="100" y2="40" stroke="#16307A" stroke-width="8" stroke-linecap="round"/><line x1="100" y1="100" x2="152" y2="70" stroke="#16307A" stroke-width="8" stroke-linecap="round"/><circle cx="100" cy="100" r="9" fill="#16307A"/></svg></div>` });
    // 마을버스
    s += box({ x: 120, y: 100, w: 90, l: 52, h: 48, c: "#20B486", front: `<div class="win bus"></div>`, left: `<div class="win bus"></div>` });
    s += ext(-30, -10, 120, `<span class="exnum sm">2h</span>`, { color: C.orange, depth: 12, cls: "float" });
    return W(s);
  };

  scenes.river = () => {
    let s = plate(460, 320, "#CFE9D6", { topBg: "#D8F0DE" });
    s += box({ x: 0, y: 0, z: 0, w: 460, l: 150, h: 3, c: "#3B7BEF", topBg: "repeating-linear-gradient(90deg,#4F8CFF 0 40px,#5D97FF 40px 80px)" });
    // 선착장
    [[-180, -78, "마곡"], [-60, -78, "망원"], [40, 78, "여의도"], [180, -78, "잠실"]].forEach(([x, y, n]) => {
      s += box({ x, y, w: 40, l: 22, h: 8, c: "#F2F5FB" });
      s += cyl({ x, y, z: 8, r: 5, h: 40, c: "#FF8A3D", n: 8 });
      s += bb(x, y, 54, `<div class="tag sm">${n}</div>`);
    });
    // 배
    let boat = box({ x: 0, y: 0, z: 3, w: 130, l: 48, h: 20, c: "#FFFFFF", frontBg: "#E6ECF7", leftBg: "#F0F4FB" });
    boat += box({ x: -8, y: 0, z: 23, w: 84, l: 36, h: 26, c: "#1E5BD8", front: `<div class="win bus"></div>`, left: `<div class="win bus"></div>` });
    s += `<div class="obj sail"><div class="obj">${boat}</div></div>`;
    s += tree(-200, 125, 0.8) + tree(-120, 130, 0.7) + tree(160, 128, 0.8) + tree(210, -125, 0.7);
    return W(s, { scale: 0.98 });
  };

  scenes.nightbus = () => {
    let s = plate(420, 320, "#1D2747", { topBg: "#22305A" });
    s += box({ x: 0, y: 40, z: 0, w: 420, l: 90, h: 2, c: "#2D3A63", topBg: "repeating-linear-gradient(90deg,#3A4A7A 0 30px,#2D3A63 30px 60px)" });
    [[-150, -90, 40, 40, 110], [-90, -110, 40, 40, 70], [110, -100, 46, 40, 140], [170, -80, 36, 36, 90], [30, -120, 40, 40, 60]].forEach((b) =>
      (s += box({ x: b[0], y: b[1], w: b[2], l: b[3], h: b[4], c: "#33467F", front: `<div class="win night"></div>`, left: `<div class="win night"></div>` })));
    s += `<div class="obj drive">` + box({ x: -20, y: 40, w: 170, l: 62, h: 62, c: "#FFB547", front: `<div class="win bus lit"></div>`, left: `<div class="win bus lit"></div>`,
      top: `<div class="sensor"></div>` }) + bb(-105, 70, 10, `<div class="beam"></div>`) + `</div>`;
    s += bb(-150, -140, 230, `<div class="emoji" style="font-size:60px">🌙</div>`, "float");
    s += bb(80, -150, 250, `<div class="stars">✦ · ✧ · ✦</div>`, "float d2");
    s += bb(-20, 40, 120, `<div class="tag">자율주행 🚌</div>`, "float d1");
    return W(s, { dark: true });
  };

  scenes.watch = () => {
    let s = plate(360, 320, "#DDF3E8", { topBg: "#E6F7EE" });
    s += box({ x: -20, y: -150, w: 90, l: 100, h: 10, c: "#2A3550" });
    s += box({ x: -20, y: 130, w: 90, l: 90, h: 10, c: "#2A3550" });
    s += box({ x: -20, y: -10, w: 170, l: 190, h: 36, c: "#1F2A44", round: true,
      top: `<div class="screen"><svg viewBox="0 0 200 200" width="100%" height="100%"><circle cx="100" cy="100" r="80" fill="none" stroke="#1B4D3A" stroke-width="16"/><circle cx="100" cy="100" r="80" fill="none" stroke="#2FE39A" stroke-width="16" stroke-linecap="round" stroke-dasharray="400 503" transform="rotate(-90 100 100)"/><circle cx="100" cy="100" r="56" fill="none" stroke="#3B2A5C" stroke-width="12"/><circle cx="100" cy="100" r="56" fill="none" stroke="#B794FF" stroke-width="12" stroke-linecap="round" stroke-dasharray="250 352" transform="rotate(-90 100 100)"/><text x="100" y="96" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">9,988</text><text x="100" y="122" text-anchor="middle" font-size="15" fill="#9FE8C8">걸음</text></svg></div>` });
    [0, 1, 2, 3].forEach((i) => (s += cyl({ x: 130, y: 80, z: i * 12, r: 30, h: 12, c: "#FFC93C", n: 16, top: i === 3 ? `<div class="coin">P</div>` : "" })));
    s += bb(130, 80, 70, `<div class="tag">+ 포인트</div>`, "float");
    s += bb(-130, -60, 140, `<div class="emoji">👟</div>`, "float d2");
    return W(s);
  };

  function heartSvg() {
    return `<svg viewBox="0 0 100 90" width="120" height="108"><path fill="currentColor" d="M50 88 C20 66 0 48 0 26 C0 11 12 0 26 0 C37 0 45 6 50 14 C55 6 63 0 74 0 C88 0 100 11 100 26 C100 48 80 66 50 88Z"/></svg>`;
  }

  function storefront(sign, c, awn) {
    let s = box({ x: 0, y: 0, w: 200, l: 130, h: 110, c: "#FFFFFF", frontBg: "#EEF2FA", leftBg: "#F6F8FD",
      front: `<div class="door" style="--c:${c}"></div>`, left: `<div class="win shop"></div>` });
    s += box({ x: 0, y: 72, z: 92, w: 212, l: 26, h: 10, c: awn, topBg: `repeating-linear-gradient(90deg,${awn} 0 20px,#fff 20px 40px)`, frontBg: `repeating-linear-gradient(90deg,${awn} 0 20px,#fff 20px 40px)` });
    s += box({ x: 0, y: 40, z: 110, w: 170, l: 12, h: 40, c, front: `<div class="sign">${sign}</div>` });
    return s;
  }

  scenes.heartstore = () => {
    let s = plate(380, 320, "#FFE9DC", { topBg: "#FFF0E6" });
    s += storefront("마음편의점", C.orange, "#FF8A3D");
    s += ext(0, 0, 200, heartSvg(), { color: C.red, depth: 14, cls: "float" });
    s += box({ x: -120, y: 120, w: 34, l: 34, h: 22, c: "#FFD54A" }) + box({ x: 120, y: 120, w: 34, l: 34, h: 22, c: "#7FB2FF" });
    s += bb(-150, 30, 40, `<div class="emoji" style="font-size:40px">☕</div>`, "float d2");
    return W(s);
  };

  scenes.books = () => {
    let s = plate(360, 320, "#E8E4FF", { topBg: "#EFECFF" });
    [["#FF8A3D", 0], ["#1E5BD8", 22], ["#20B486", 44], ["#FFD54A", 66]].forEach(([c, z], i) =>
      (s += box({ x: -80 + (i % 2) * 8, y: 40 - (i % 2) * 6, z, w: 150, l: 104, h: 22, c, front: `<div class="pages"></div>` })));
    // 노트북
    s += box({ x: 100, y: 40, w: 130, l: 90, h: 8, c: "#C9D2E6" });
    s += `<div class="obj" style="transform:translate3d(35px,-20px,94px) rotateX(-80deg)">${face(130, 86, "linear-gradient(135deg,#2A3B7A,#1B2550)", "", `<div class="lap">AI<br><small>맞춤 학습</small></div>`)}</div>`;
    s += bb(-76, 34, 100, `<div class="emoji" style="font-size:64px">🎓</div>`, "float");
    s += bb(110, -40, 150, `<div class="emoji" style="font-size:40px">✨</div>`, "float d2");
    return W(s);
  };

  scenes.blocks = () => {
    let s = plate(360, 320, "#FFF3D6", { topBg: "#FFF7E3" });
    const blk = (x, y, z, c, t) => box({ x, y, z, w: 74, l: 74, h: 74, c, top: `<div class="lt">${t}</div>`, front: `<div class="lt">${t}</div>`, left: `<div class="lt">${t}</div>` });
    s += blk(-80, 40, 0, C.blue, "서") + blk(0, 40, 0, C.orange, "울") + blk(80, 40, 0, C.green, "♥") + blk(-40, 40, 74, C.yellow, "아") + blk(40, 40, 74, C.purple, "이");
    s += bb(0, 40, 170, `<div class="emoji" style="font-size:66px">👶</div>`, "float");
    s += bb(-140, -80, 40, `<div class="emoji" style="font-size:44px">🍼</div>`, "float d2");
    s += bb(140, -90, 40, `<div class="emoji" style="font-size:44px">🧸</div>`, "float d3");
    return W(s);
  };

  scenes.shop = () => {
    let s = plate(380, 320, "#E1F5EC", { topBg: "#EAF8F1" });
    s += storefront("동행상점", C.green, "#20B486");
    s += bb(-130, 110, 20, `<div class="emoji" style="font-size:58px">👵</div>`);
    s += bb(-70, 130, 20, `<div class="emoji" style="font-size:58px">👴</div>`);
    s += bb(110, 20, 200, `<div class="pricetag">할인 <b>%</b></div>`, "float");
    return W(s);
  };

  scenes.garden = () => {
    let s = plate(400, 340, "#BFE8CB", { topBg: "linear-gradient(135deg,#CFF0D8,#B5E3C2)" });
    s += box({ x: 0, y: 0, z: 0, w: 60, l: 340, h: 2, c: "#F4E3C3" });
    s += box({ x: 0, y: 0, z: 0, w: 400, l: 50, h: 2, c: "#F4E3C3" });
    [[-140, -120], [-80, -130], [-150, -40], [120, -120], [160, -50], [-140, 110], [-80, 130], [140, 110], [90, 140]].forEach(([x, y], i) =>
      (s += tree(x, y, 0.9 + (i % 3) * 0.12, ["#2FBF71", "#27A862", "#55D18A"][i % 3])));
    s += box({ x: 70, y: -60, w: 70, l: 22, h: 14, c: "#C98B55" });
    s += bb(-60, 60, 10, `<div class="emoji" style="font-size:34px">🌷🌼🌷</div>`);
    s += bb(0, 0, 60, `<div class="tag big">🚶 걸어서 닿는 정원</div>`, "float");
    return W(s);
  };

  scenes.chip = () => {
    let s = plate(380, 320, "#E8E4FF", { topBg: "#EFECFF" });
    for (let i = 0; i < 6; i++) {
      s += box({ x: -150 + i * 22, y: -80, w: 8, l: 30, h: 4, c: "#E0B300" });
      s += box({ x: -150 + i * 22, y: 100, w: 8, l: 30, h: 4, c: "#E0B300" });
    }
    s += box({ x: -95, y: 10, w: 150, l: 150, h: 24, c: "#2A2550", topBg: "linear-gradient(135deg,#3A2F7A,#1E1A40)", top: `<div class="chipface">AI</div>` });
    s += bb(-95, 10, 110, `<div class="emoji" style="font-size:56px">🧑‍💼</div>`, "float");
    // 시간 비교 막대
    s += box({ x: 70, y: 40, w: 46, l: 46, h: 170, c: "#B9C3D9" }) + bb(70, 40, 182, `<div class="tag sm">기존</div>`);
    s += box({ x: 140, y: 40, w: 46, l: 46, h: 34, c: C.purple }) + bb(140, 40, 46, `<div class="tag sm">AI 활용<br><b>최대 80%↓</b></div>`);
    return W(s);
  };

  scenes.shield = () => {
    let s = plate(360, 320, "#E3EBFB", { topBg: "#EAF0FD" });
    [[-120, 90], [-60, 120], [110, 90], [130, -60], [-130, -60]].forEach(([x, y], i) =>
      (s += box({ x, y, w: 40, l: 40, h: 26 + (i % 3) * 20, c: ["#7FB2FF", "#A9C6FF", "#5B8DF0"][i % 3], top: `<div class="lt sm">01</div>` })));
    s += shadow(0, 0, 170, 120, 0.3);
    s += ext(0, 0, 60, `<svg viewBox="0 0 100 120" width="150" height="180"><path fill="currentColor" d="M50 0 L100 18 V56 C100 88 78 108 50 120 C22 108 0 88 0 56 V18 Z"/></svg>`, { color: C.blue, depth: 18, cls: "float" });
    s += bb(0, 0, 120, `<div class="emoji" style="font-size:64px">🔒</div>`, "float");
    return W(s);
  };

  scenes.stairs = () => {
    let s = plate(420, 300, "#E3EBFB", { topBg: "#EAF0FD" });
    [["1", "📚", C.sky], ["2", "🤖", C.blue], ["3", "🎨", C.purple], ["4", "✅", C.green]].forEach(([n, e, c], i) => {
      const x = -150 + i * 100, h = 40 + i * 50;
      s += box({ x, y: 0, w: 96, l: 140, h, c, top: `<div class="tnum">${n}</div>` });
      s += bb(x, 0, h + 16, `<div class="emoji" style="font-size:48px">${e}</div>`, `float d${i}`);
    });
    return W(s, { scale: 0.95 });
  };

  scenes.chat = () => {
    let s = plate(360, 320, "#E8E4FF", { topBg: "#EFECFF" });
    const panel = (z, c, txt, x, y) => box({ x, y, z, w: 220, l: 90, h: 6, c, top: `<div class="bubble">${txt}</div>` });
    s += shadow(0, 0, 230, 200, 0.2);
    s += `<div class="obj float">` + panel(70, "#FFFFFF", "정책 10개 골라 줘", -10, 60) + `</div>`;
    s += `<div class="obj float d1">` + panel(140, "#E3DBFF", "20장으로 구성해 줘", 10, 0) + `</div>`;
    s += `<div class="obj float d2">` + panel(210, "#FFFFFF", "30초 대본 써 줘", -10, -60) + `</div>`;
    s += bb(140, 80, 30, `<div class="emoji" style="font-size:70px">🤖</div>`, "float d3");
    return W(s);
  };

  scenes.checks = () => {
    let s = plate(380, 320, "#E1F5EC", { topBg: "#EAF8F1" });
    [C.orange, C.blue, C.green].forEach((c, i) => {
      const z = 20 + i * 70;
      s += `<div class="obj float d${i}">` + box({ x: -10 + i * 10, y: 30 - i * 30, z, w: 220, l: 120, h: 10, c: "#FFFFFF", leftBg: "#EEF2FA", frontBg: "#E3E9F5",
        top: `<div class="chk"><span style="background:${c}">✓</span><i></i><i></i></div>` }) + `</div>`;
    });
    s += bb(150, 100, 20, `<div class="emoji" style="font-size:54px">💡</div>`, "float d3");
    return W(s);
  };

  scenes.calendar = (slide) => {
    const items = (slide && slide.bullets) || [];
    const cols = [C.blue, C.green, C.orange, C.purple, C.red, "#00A3C4"];
    let s = plate(540, 300, "#E3EBFB", { topBg: "#EAF0FD" });
    items.forEach((it, i) => {
      const [m, t] = it.split("|");
      const x = -215 + i * 86, h = 50 + i * 26;
      s += box({ x, y: 20, w: 72, l: 72, h, c: "#FFFFFF", leftBg: "#EEF2FA", frontBg: "#F7F9FE", topBg: cols[i],
        front: `<div class="cal"><div class="calh" style="background:${cols[i]}"></div><b>${m}</b></div>` });
      s += bb(x, 20, h + 16, `<div class="tag sm cal-t" style="--c:${cols[i]}">${t}</div>`, `float d${i % 4}`);
    });
    return W(s, { scale: 1 });
  };

  window.SEOUL_SCENES = { render: (name, slide) => (scenes[name] || scenes.skyline)(slide), names: Object.keys(scenes) };
})();
