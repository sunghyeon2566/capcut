#!/usr/bin/env node
/*
 * index.html 을 프레임 단위로 캡처해 MP4 로 만듭니다.
 *
 *   node render.cjs                       전체 렌더 (배경음 포함 + 무음 버전)
 *   node render.cjs --stills 1.5,9,30     지정한 시각(초)의 스틸 PNG 만 저장
 *   node render.cjs --from 10 --to 14     구간만 렌더 (미리보기용)
 *   node render.cjs --no-audio            배경음 없이 렌더
 *   node render.cjs --jobs 4              동시에 캡처할 브라우저 탭 수 (기본: CPU 코어 수, 최대 4)
 *
 * 필요: Node 18+, playwright(chromium), ffmpeg, python3 + numpy(배경음)
 */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const has = name => args.includes(name);

function run(cmd, argv) {
  const r = spawnSync(cmd, argv, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${cmd} exited with ${r.status}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  // one browser per worker: tabs of a single browser share one (software) GPU process and don't run in parallel
  const browsers = [];
  const openPage = async () => {
    const browser = await chromium.launch({
      proxy: proxy ? { server: proxy } : undefined,
      args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
    });
    browsers.push(browser);
    const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    pg.on('pageerror', e => console.error('[page error]', e.message));
    await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '?render=1');
    await pg.evaluate(() => window.__ready);
    return pg;
  };
  const page = await openPage();
  const meta = await page.evaluate(() => window.__meta);
  const shotOn = async (pg, t) => { await pg.evaluate(x => window.__seek(x), t); return pg.screenshot({ type: 'png' }); };
  const shot = t => shotOn(page, t);

  if (opt('--stills')) {
    const dir = path.join(OUT, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const s of opt('--stills').split(',').map(Number)) {
      const file = path.join(dir, `t${s.toFixed(2).padStart(5, '0')}.png`);
      fs.writeFileSync(file, await shot(s));
      console.log('still', file);
    }
    await Promise.all(browsers.map(b => b.close()));
    return;
  }

  const from = Number(opt('--from') ?? 0);
  const to = Math.min(Number(opt('--to') ?? meta.duration), meta.duration);
  const partial = from > 0 || to < meta.duration;
  const name = opt('--name') ?? (partial ? `preview_${from}-${to}` : 'kyt-promo');
  const withAudio = !has('--no-audio') && !partial;
  const wav = path.join(OUT, 'kyt-promo.wav');

  if (withAudio) {
    const cueFile = path.join(OUT, 'cues.json');
    fs.writeFileSync(cueFile, JSON.stringify(meta, null, 1));
    run('python3', [path.join(ROOT, 'audio', 'make_audio.py'), cueFile, wav]);
  }

  const mp4 = path.join(OUT, `${name}.mp4`);
  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'image2pipe', '-framerate', String(meta.fps), '-c:v', 'png', '-i', '-',
    ...(withAudio ? ['-i', wav] : []),
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-tune', 'film',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    ...(withAudio ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : ['-an']),
    '-movflags', '+faststart', mp4,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited with ' + c)))));

  // several tabs capture interleaved frames; a single writer feeds ffmpeg in order
  const jobs = Math.max(1, Number(opt('--jobs') ?? Math.min(4, os.cpus().length)));
  const pages = [page, ...(await Promise.all(Array.from({ length: jobs - 1 }, openPage)))];
  const first = Math.round(from * meta.fps), last = Math.round(to * meta.fps);
  const started = Date.now();
  const ready = new Map();
  let next = first, writing = Promise.resolve();
  const flush = async () => {
    while (ready.has(next)) {
      const buf = ready.get(next); ready.delete(next);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((next - first) % 30 === 0) {
        const el = (Date.now() - started) / 1000, n = next - first + 1;
        process.stdout.write(`\rframe ${next}/${last}  ${(n / el).toFixed(1)} fps  eta ${Math.round((last - next) * el / n)}s   `);
      }
      next++;
    }
  };
  await Promise.all(pages.map(async (pg, w) => {
    for (let f = first + w; f < last; f += jobs) {
      while (f - next > jobs * 3) await new Promise(r => setTimeout(r, 10));
      ready.set(f, await shotOn(pg, f / meta.fps));
      writing = writing.then(flush);
    }
  }));
  await writing;
  ff.stdin.end();
  await done;
  await Promise.all(browsers.map(b => b.close()));
  console.log('\nwrote', mp4);

  if (withAudio) {
    const silent = path.join(OUT, `${name}_no-audio.mp4`);
    run('ffmpeg', ['-y', '-v', 'error', '-i', mp4, '-an', '-c', 'copy', silent]);
    console.log('wrote', silent);
  }
})().catch(e => { console.error(e); process.exit(1); });
