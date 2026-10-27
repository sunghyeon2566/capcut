/* 3D 웹 프레젠테이션 — 슬라이드 생성과 조작 */
(function () {
  "use strict";
  const D = window.DECK;
  const R = window.SEOUL_SCENES;
  const params = new URLSearchParams(location.search);

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const part = (s) => D.parts[s.part];
  const L = (s) => D.layouts[s.layout];

  function artBox(s, extraClass) {
    const [x, y, w, h] = L(s).art;
    return `<div class="art ${extraClass || ""}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--k:${L(s).k}">${R.render(s.scene, s)}</div>`;
  }

  // 핵심 숫자 카드 — 3D 그림 왼쪽 아래 빈 공간에 놓습니다
  function statCard(s) {
    const [x, y, , h] = L(s).art;
    return `<div class="statcard" style="left:${x}px;bottom:${900 - (y + h)}px"><span class="v">${esc(s.stat.value)}</span><span class="u">${esc(s.stat.unit)}</span><span class="l">${esc(s.stat.label)}</span></div>`;
  }

  function textBlock(s) {
    let h = "";
    h += `<div class="anim"><span class="kicker">${esc(s.kicker)}</span></div>`;
    h += `<h1 class="title anim">${esc(s.title)}</h1>`;
    if (s.lead) h += `<p class="lead anim">${esc(s.lead)}</p>`;
    if (s.layout === "tips") {
      h += `<div class="anim"><div class="tips-head"><div>😥 이런 문제가</div><div></div><div>😊 이렇게 해결</div></div><div class="tips">` +
        s.bullets.map((b) => { const [p, q] = b.split("|"); return `<div class="tip"><div class="p">${esc(p)}</div><div class="ar">➜</div><div class="s">${esc(q)}</div></div>`; }).join("") +
        `</div></div>`;
    } else if (s.layout !== "calendar" && s.bullets.length) {
      h += `<ul class="bullets anim">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
    }
    return h;
  }

  function slideHtml(s, i) {
    const [tx, ty, tw] = L(s).text;
    const p = part(s);
    return `<section class="slide layout-${s.layout}" style="--pc:${p.color}" data-i="${i}" aria-roledescription="slide" aria-label="${i + 1} / ${D.slides.length}">
      <div class="brand"><img src="assets/seoul-logo.svg" alt="서울특별시"></div>
      ${p.id > 0 ? `<div class="chip-part">${p.emoji} ${esc(p.name)}</div>` : ""}
      ${artBox(s)}
      ${s.stat ? statCard(s) : ""}
      <div class="txt" style="left:${tx}px;top:${ty}px;width:${tw}px">${textBlock(s)}</div>
      <div class="wave"></div>
      <div class="pageno"><b>${String(i + 1).padStart(2, "0")}</b> / ${D.slides.length}</div>
    </section>`;
  }

  // PPTX 제작용: ?art=번호 이면 해당 슬라이드의 3D 그림만 투명 배경으로 그립니다
  if (params.has("art")) {
    const s = D.slides[parseInt(params.get("art"), 10) - 1];
    const [, , w, h] = L(s).art;
    document.body.className = "artonly static";
    document.body.innerHTML = `<div class="art-only" id="art" style="width:${w}px;height:${h}px;--k:${L(s).k}">${R.render(s.scene, s)}</div>`;
    return;
  }

  const stage = document.getElementById("stage");
  stage.innerHTML = D.slides.map(slideHtml).join("");
  const slides = [...stage.querySelectorAll(".slide")];
  const count = document.getElementById("count");
  const bar = document.querySelector(".progress i");
  const menu = document.getElementById("menu");
  let cur = -1;

  // 목차 메뉴
  let mh = "";
  D.parts.forEach((p) => {
    const items = D.slides.map((s, i) => [s, i]).filter(([s]) => s.part === p.id);
    if (!items.length) return;
    mh += `<h2>${p.emoji} ${esc(p.name)}</h2>`;
    mh += items.map(([s, i]) => `<button data-go="${i}"><span>${i + 1}</span>${esc(s.card)}</button>`).join("");
  });
  document.getElementById("menuList").innerHTML = mh;

  function fit() {
    const sc = Math.min(window.innerWidth / 1600, (window.innerHeight - 20) / 900) * 0.97;
    stage.style.transform = `scale(${sc})`;
  }

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    slides.forEach((el, i) => {
      el.classList.toggle("active", i === n);
      el.classList.toggle("past", i < n);
      el.setAttribute("aria-hidden", i === n ? "false" : "true");
    });
    cur = n;
    count.textContent = `${n + 1} / ${slides.length}`;
    bar.style.width = `${((n + 1) / slides.length) * 100}%`;
    menu.querySelectorAll("[data-go]").forEach((b) => b.classList.toggle("cur", +b.dataset.go === n));
    if (location.hash !== `#${n + 1}`) history.replaceState(null, "", `#${n + 1}`);
  }
  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  function fromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    go(Number.isFinite(n) ? n - 1 : 0);
  }

  document.getElementById("next").onclick = next;
  document.getElementById("prev").onclick = prev;
  document.getElementById("menuBtn").onclick = () => menu.classList.toggle("open");
  document.getElementById("menuClose").onclick = () => menu.classList.remove("open");
  menu.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { go(+b.dataset.go); menu.classList.remove("open"); }
  });
  document.getElementById("fsBtn").onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  };
  document.querySelector(".viewport").addEventListener("click", (e) => {
    if (e.target.closest("a,button")) return;
    (e.clientX > window.innerWidth / 2 ? next : prev)();
  });
  window.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
    else if (k === "Home") go(0);
    else if (k === "End") go(slides.length - 1);
    else if (k === "f" || k === "F") document.getElementById("fsBtn").click();
    else if (k === "m" || k === "M") menu.classList.toggle("open");
    else if (k === "Escape") menu.classList.remove("open");
  });
  let tx0 = null;
  window.addEventListener("touchstart", (e) => { tx0 = e.touches[0].clientX; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (tx0 == null) return;
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    tx0 = null;
  });
  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", fromHash);
  fit();
  fromHash();
})();
