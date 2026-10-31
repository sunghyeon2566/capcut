// 프로젝트의 index.html을 헤드리스 크로미움에서 프레임 단위로 캡처해 MP4로 만든다.
//
//   node render.mjs <project_dir>                         # <project_dir>/out/video.mp4
//   node render.mjs <project_dir> --stills 1.5,7,24       # 지정 시각의 PNG만 out/still_<t>.png
//   node render.mjs <project_dir> --audio out/sound.wav   # 소리를 함께 먹인다(-shortest)
//   옵션: --out <file>  --crf 22  --workers 4  --root <dir>(서빙 루트, 기본은 project_dir)
//
// index.html이 지켜야 할 약속:
//   window.DURATION, window.FPS, window.sceneReady = true (폰트·이미지 로드 후),
//   window.captureFrame(t) → canvas.toDataURL('image/png'),  ?render=1 이면 컨트롤 숨김
//
// 필요: Node 18+, ffmpeg, playwright (+chromium). 없으면: npm i -D playwright && npx playwright install chromium

import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('playwright를 찾지 못했습니다. npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const argv = process.argv.slice(2);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const args = {};
argv.forEach((a, i) => { if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true; });

const project = path.resolve(positional[0] || '.');
const root = path.resolve(args.root || project);
const outDir = path.join(project, 'out');
fs.mkdirSync(outDir, { recursive: true });
const out = path.resolve(args.out || path.join(outDir, 'video.mp4'));
const workers = Number(args.workers || 4);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.json': 'application/json',
};
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const rel = path.relative(root, path.join(project, 'index.html')).split(path.sep).join('/');
const url = `http://127.0.0.1:${server.address().port}/${rel}?render=1`;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 90000 });
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
    const ff = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-'];
    if (args.audio) ff.push('-i', path.resolve(project, String(args.audio)));
    ff.push('-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 22), '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
    if (args.audio) ff.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    ff.push(out);
    const enc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
    const write = buf => new Promise(r => (enc.stdin.write(buf) ? r() : enc.stdin.once('drain', r)));
    const started = Date.now();
    for (let f = 0; f < total; f += pages.length) {
      const batch = await Promise.all(pages.map((p, k) => (f + k < total ? pngOf(p, (f + k) / fps) : null)));
      for (const b of batch) if (b) await write(b);
      if ((f / pages.length) % 30 === 0) process.stdout.write(`\r${Math.min(total, f + pages.length)}/${total} frames`);
    }
    enc.stdin.end();
    await new Promise((res, rej) => enc.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
    console.log(`\n${out} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
} finally {
  await browser.close();
  server.close();
}
