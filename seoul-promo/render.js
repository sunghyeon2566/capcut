// 3D 웹 장면을 PNG로 저장 (PPTX 제작용) — build.py 가 호출합니다.
// 사용법: node render.js <public/seoul-promo 경로> <출력 폴더> <슬라이드 수> [--previews]
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

(async () => {
  const [site, out, countArg, flag] = process.argv.slice(2);
  const count = parseInt(countArg, 10);
  fs.mkdirSync(out, { recursive: true });
  const base = "file://" + path.resolve(site);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 2 });

  for (let i = 1; i <= count; i++) {
    await page.goto(`${base}/slides.html?art=${i}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.locator("#art").screenshot({ path: path.join(out, `art-${String(i).padStart(2, "0")}.png`), omitBackground: true });
  }

  // 로고 PNG
  await page.setContent(`<html><body style="margin:0;background:transparent"><img id="l" src="${base}/assets/seoul-logo.svg" style="height:128px;display:block"></body></html>`);
  await page.waitForTimeout(200);
  await page.locator("#l").screenshot({ path: path.join(out, "logo.png"), omitBackground: true });

  // 검수용 전체 슬라이드 미리보기
  if (flag === "--previews") {
    const pv = await browser.newPage({ viewport: { width: 1600, height: 920 }, deviceScaleFactor: 1 });
    for (let i = 1; i <= count; i++) {
      await pv.goto(`${base}/slides.html#${i}`);
      await pv.evaluate(() => document.fonts.ready);
      await pv.waitForTimeout(1600);
      await pv.screenshot({ path: path.join(out, `web-${String(i).padStart(2, "0")}.png`) });
    }
    const home = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    await home.goto(`${base}/index.html`);
    await home.waitForTimeout(800);
    await home.screenshot({ path: path.join(out, "home.png"), fullPage: true });
    const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await mob.goto(`${base}/index.html`);
    await mob.waitForTimeout(800);
    await mob.screenshot({ path: path.join(out, "home-mobile.png"), fullPage: true });
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
