#!/usr/bin/env python3
"""Synthesise the promo soundtrack: a 96 BPM ambient bed plus sound effects
placed on the cue times exported by index.html (window.__meta.cues).

    python3 make_audio.py cues.json out.wav

Everything is generated from scratch with numpy, so the track is free of
third-party rights. Only numpy is required.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
RNG = np.random.default_rng(20261028)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a, r, sustain_len):
    """attack seconds, release seconds, sustain samples before release."""
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    ns = min(n, sustain_len)
    if ns < n:
        e[ns:] *= np.exp(-np.arange(n - ns) / (r * SR / 4.6))
    return e


def lowpass(x, cutoff):
    """FFT brick-ish low-pass with a soft knee."""
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    g = 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * (g[:, None] if x.ndim == 2 else g), n=x.shape[0], axis=0)


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = (1 / (1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / (1 + (f / hi) ** 4))
    return np.fft.irfft(X * g, n=len(x))


class Bus:
    def __init__(self, seconds):
        self.buf = np.zeros((int(seconds * SR) + SR * 4, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        """mono or stereo signal at time t (seconds); pan -1..1 (equal power)."""
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l, sig * r], axis=1) * np.sqrt(2)
        n = min(len(sig), len(self.buf) - i)
        if n > 0:
            self.buf[i:i + n] += sig[:n] * gain


# ---------------------------------------------------------------- instruments
def pad(notes, dur):
    n = int((dur + 1.8) * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, m in enumerate(notes):
        f0 = midi(m)
        for ch, det in enumerate((-0.0035, 0.0035)):
            f = f0 * (1 + det)
            ph = RNG.uniform(0, 2 * np.pi)
            v = np.zeros(n)
            for h in range(1, 7):
                if f * h > 6000:
                    break
                v += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.7
            out[:, ch] += v
    out /= len(notes)
    e = env_adsr(n, 1.1, 1.6, int(dur * SR))
    lfo = 1 + 0.12 * np.sin(2 * np.pi * 0.23 * t)[:, None]
    return lowpass(out * e[:, None] * lfo, 2400)


def celesta(m, vel=1.0, length=2.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    v = np.zeros(n)
    for ratio, amp, dec in ((1, 1, 1.5), (2, .32, .8), (3, .12, .45), (4.07, .07, .3), (5.9, .03, .18)):
        v += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / dec)
    att = np.minimum(1, t / 0.003)
    return v * att * vel


def bell(m, vel=1.0, length=3.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    v = np.zeros(n)
    for ratio, amp, dec in ((1, 1, 2.4), (2.0, .4, 1.6), (2.76, .35, 1.1), (5.4, .18, .6), (8.93, .08, .3)):
        v += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / dec)
    return v * np.minimum(1, t / 0.002) * vel


def bass(m, dur):
    n = int((dur + .4) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    v = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t) + .08 * np.sin(6 * np.pi * f * t)
    e = env_adsr(n, .03, .35, int(dur * SR)) * (0.75 + 0.25 * np.exp(-t / .5))
    return v * e


def kick():
    n = int(.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) + .25 * np.exp(-t * 400) * RNG.standard_normal(n)


def hat():
    n = int(.08 * SR)
    t = np.arange(n) / SR
    return bandpass(RNG.standard_normal(n), 6000, 14000) * np.exp(-t / .018)


def whoosh(length=.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    v = bandpass(noise, 250, 3800)
    peak = .62
    e = np.where(t < peak, (t / peak) ** 2.4, np.exp(-(t - peak) / .09))
    return v * e, peak


def flutter(length=.7):
    n = int(length * SR)
    out = np.zeros(n)
    for _ in range(22):
        s = int(RNG.uniform(0, length - .05) * SR)
        m = int(.03 * SR)
        tt = np.arange(m) / SR
        out[s:s + m] += bandpass(RNG.standard_normal(m), 1200, 7000) * np.exp(-tt / .008) * RNG.uniform(.4, 1)
    return out


def tick():
    n = int(.03 * SR)
    t = np.arange(n) / SR
    return bandpass(RNG.standard_normal(n), 2500, 9000) * np.exp(-t / .0018) + .3 * np.sin(2 * np.pi * 2100 * t) * np.exp(-t / .004)


def key():
    n = int(.06 * SR)
    t = np.arange(n) / SR
    return bandpass(RNG.standard_normal(n), 700, 4200) * np.exp(-t / .006) + .4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / .01)


def scratch():
    n = int(.3 * SR)
    t = np.arange(n) / SR
    rough = .6 + .4 * np.sign(np.sin(2 * np.pi * 38 * t + RNG.uniform(0, 6)))
    e = np.minimum(1, t / .02) * np.exp(-np.maximum(0, t - .18) / .03)
    return bandpass(RNG.standard_normal(n), 1800, 7500) * rough * e


def pop():
    n = int(.15 * SR)
    t = np.arange(n) / SR
    f = 260 + 520 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .035) + .2 * bandpass(RNG.standard_normal(n), 2000, 8000) * np.exp(-t / .004)


def click():
    n = int(.04 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1900 * t) + .5 * np.sin(2 * np.pi * 3800 * t)) * np.exp(-t / .006)


def riser(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = t / length
    noise = RNG.standard_normal(n)
    # one-pole low-pass whose cutoff climbs from 300 Hz to 9 kHz
    fc = 300 * (30 ** x)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += a[i] * (noise[i] - acc)
        y[i] = acc
    sweep = np.sin(2 * np.pi * np.cumsum(180 * (8 ** x)) / SR) * .25
    tail = np.minimum(1, (length - t) / .04)  # no click where the impact takes over
    return (y * 1.6 + sweep) * x ** 2.2 * tail


def impact():
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    f = 38 + 30 * np.exp(-t * 6)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .9)
    hit = lowpass(RNG.standard_normal(n), 1800) * np.exp(-t / .18)
    return boom + .5 * hit


def reverb_ir(seconds=2.6, decay=.75):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = RNG.standard_normal((n, 2)) * np.exp(-t / (decay / 2.3))[:, None]
    ir = lowpass(ir, 5000)
    ir[:int(.012 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def convolve(x, ir):
    n = len(x) + len(ir)
    N = 1 << (n - 1).bit_length()
    out = np.fft.irfft(np.fft.rfft(x, N, axis=0) * np.fft.rfft(ir, N, axis=0), N, axis=0)
    return out[:len(x)]


# ---------------------------------------------------------------- arrangement
CHORDS = [  # (start bar, bars, pad voicing, bass note, arpeggio tones)
    (0, 2, [50, 57, 61, 64, 66], 38, [74, 76, 78, 81, 85]),   # Dmaj9
    (2, 2, [47, 54, 57, 61, 62], 35, [71, 73, 74, 78, 81]),   # Bm9
    (4, 1, [43, 50, 54, 57, 59], 31, [71, 74, 78, 79, 81]),   # Gmaj9
    (5, 1, [45, 52, 57, 59, 62], 33, [69, 71, 74, 76, 78]),   # A6sus
    (6, 1, [47, 54, 57, 62, 66], 35, [71, 74, 78, 81, 83]),   # Bm7
    (7, 1, [43, 50, 54, 59, 62], 31, [71, 74, 78, 79, 83]),   # Gmaj7
    (8, 1, [40, 47, 50, 54, 55], 28, [67, 71, 74, 78, 79]),   # Em9
    (9, 1, [45, 52, 55, 57, 62], 33, [69, 74, 76, 79, 81]),   # A7sus4
    (10, .5, [43, 50, 54, 59, 62], 31, [71, 74, 78, 79, 83]),  # Gmaj7
    (10.5, .5, [45, 52, 57, 61, 64], 33, [69, 73, 76, 81, 85]),  # A
    (11, 2, [50, 57, 61, 64, 66], 38, [74, 78, 81, 85, 86]),  # Dmaj9 (end card)
]


def build(meta, out_path):
    dur = meta['duration']
    beat = 60 / meta['bpm']
    bar = beat * 4
    music, drums, sfx = Bus(dur), Bus(dur), Bus(dur)

    for start, bars, voicing, root, arp in CHORDS:
        t0, length = start * bar, bars * bar
        if t0 >= dur:
            continue
        music.add(pad(voicing, length), t0, .55)
        if t0 >= 10.0 - 1e-6:
            drums.add(bass(root, length - .05), t0, .32)
        # celesta: sparse quarters in the intro, 8ths from the turn, 16ths in the final build
        step = beat if t0 < 10 else beat / 2
        if 25.0 <= t0 < 27.5:
            step = beat / 4
        k = 0
        tt = t0
        while tt < t0 + length - 1e-6 and tt < dur - 1.5:
            if t0 >= 27.5:
                break
            if t0 < 4.375 and k % 2 == 1:
                k += 1
                tt += step
                continue
            note = arp[(k * 2 + (k // 4)) % len(arp)] if step < beat else arp[k % len(arp)]
            vel = .55 + .25 * RNG.random() + (.15 if k % 4 == 0 else 0)
            if 25.0 <= t0 < 27.5:
                vel *= .55 + .45 * ((tt - 25.0) / 2.5)
            music.add(celesta(note, vel), tt, .16, pan=RNG.uniform(-.45, .45))
            k += 1
            tt += step

    # end-card flourish: a rising run that lands on the logo, then a held bell
    for i, m in enumerate([62, 66, 69, 73, 74, 78, 81, 86]):
        music.add(celesta(m, .8 - i * .04, 3.0), 27.5 + i * .06, .17, pan=-.5 + i * .14)

    # drums: kick on 1 & 3 from the turn until the build, shaker on the off-beats from STEP 01
    t = 10.0
    while t < 25.0 - 1e-6:
        drums.add(kick(), t, .55)
        t += beat * 2
    t = 13.75 + beat / 2
    while t < 25.0 - 1e-6:
        drums.add(hat(), t, .07, pan=.35)
        t += beat

    for c in meta['cues']:
        t, k, v = c['t'], c['k'], c.get('v', 1)
        if k == 'whoosh':
            w, peak = whoosh()
            sfx.add(w, t - peak, .16 * v, pan=RNG.uniform(-.3, .3))
        elif k == 'flutter':
            sfx.add(flutter(), t - .05, .2 * v, pan=RNG.uniform(-.3, .3))
        elif k == 'tick':
            sfx.add(tick(), t, .07 * v, pan=RNG.uniform(-.15, .15))
        elif k == 'key':
            sfx.add(key(), t, .14 * v, pan=RNG.uniform(-.2, .2))
        elif k == 'scratch':
            sfx.add(scratch(), t, .09 * v, pan=.25)
        elif k == 'pop':
            sfx.add(pop(), t, .26 * v)
        elif k == 'click':
            sfx.add(click(), t, .12 * v)
        elif k == 'chime':
            music.add(bell(86, v), t, .14)
            music.add(bell(93, v * .7), t + .07, .1, pan=.3)
        elif k == 'riser':
            sfx.add(riser(27.5 - t), t, .11)
        elif k == 'impact':
            sfx.add(impact(), t, .6)

    ir = reverb_ir()
    wet = convolve(music.buf, ir)
    mix = music.buf * .8 + wet * .55 + drums.buf + sfx.buf + convolve(sfx.buf, ir) * .18

    n = int(dur * SR)
    mix = mix[:n]
    tt = np.arange(n) / SR
    fade = np.minimum(1, tt / .25) * np.clip((dur - tt) / 1.2, 0, 1) ** 1.5
    mix *= fade[:, None]

    # about -14 LUFS integrated (the level Reels/Shorts/TikTok normalise to), then a soft limiter
    rms = np.sqrt(np.mean(mix ** 2))
    mix *= 10 ** (-18.5 / 20) / max(rms, 1e-9)
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    peak = np.abs(mix).max()
    if peak > .89:
        mix *= .89 / peak

    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wrote {out_path}  {dur:.2f}s  rms {20 * np.log10(np.sqrt(np.mean(mix ** 2))):.1f} dBFS')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as f:
        build(json.load(f), sys.argv[2])
