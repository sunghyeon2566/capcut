// index.html을 헤드리스 크로미움에서 프레임 단위로 캡처해 MP4로 만든다. (1920×1080)
//
//   python3 sound.py && node render.mjs --audio out/sound.wav   # out/deepmarkon-special.mp4 (1920x1080, 30fps)
//   node render.mjs --stills 1.5,7,24     # 지정 시각의 PNG만 out/ 에 저장
//   (폰트는 ../seoul-city-hall, ../sunghyeon-promo 의 것을 함께 쓰므로 motion/ 폴더 전체를 서빙한다)
//
// 필요: Node 18+, ffmpeg, playwright(+chromium)

import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
  }, []),
);
const outDir = path.join(dir, 'out');
fs.mkdirSync(outDir, { recursive: true });
const out = path.resolve(args.out || path.join(outDir, 'deepmarkon-special.mp4'));
const workers = Number(args.workers || 4);

const MIME = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.wav': 'audio/wav' };
const root = path.dirname(dir);
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${path.basename(dir)}/index.html?render=1`;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 60000 });
  return page;
}
const pngOf = async (page, t) => Buffer.from((await page.evaluate(tt => window.captureFrame(tt), t)).split(',')[1], 'base64');

try {
  if (args.stills) {
    const page = await openPage();
    for (const s of String(args.stills).split(',')) {
      const f = path.join(outDir, `still_${Number(s).toFixed(2)}.png`);
      fs.writeFileSync(f, await pngOf(page, Number(s)));
      console.log(f);
    }
  } else {
    const pages = await Promise.all(Array.from({ length: workers }, openPage));
    const { fps, dur } = await pages[0].evaluate(() => ({ fps: window.FPS, dur: window.DURATION }));
    const total = Math.round(fps * dur);
    const ff = [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    ];
    if (args.audio) ff.push('-i', path.resolve(String(args.audio)));
    ff.push('-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 22), '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
    if (args.audio) ff.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    ff.push(out);
    const enc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
    const write = buf => new Promise(r => (enc.stdin.write(buf) ? r() : enc.stdin.once('drain', r)));
    const started = Date.now();
    for (let f = 0; f < total; f += pages.length) {
      const batch = await Promise.all(pages.map((p, k) => (f + k < total ? pngOf(p, (f + k) / fps) : null)));
      for (const b of batch) if (b) await write(b);
      if ((f / pages.length) % 15 === 0) process.stdout.write(`\r${Math.min(total, f + pages.length)}/${total} frames`);
    }
    enc.stdin.end();
    await new Promise((res, rej) => enc.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
    console.log(`\n${out} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
} finally {
  await browser.close();
  server.close();
}
