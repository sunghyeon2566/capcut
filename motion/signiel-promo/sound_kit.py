"""numpy만으로 가이드 사운드트랙을 합성하는 작은 도구 상자.

프로젝트의 sound.py가 이렇게 쓴다:

    from sound_kit import Mix, kick, clap, hat, bass, pad, pluck, pop, tick, whoosh, riser, impact, bell, thud, hz

    m = Mix(dur=30.0)
    m.place(kick(), 3.0, 0.8)
    m.place(pad("C", 2.2), 3.0, 0.25, rev=0.3)
    m.write("out/sound.wav")

규칙: 컷·전환 시각은 영상의 T와 같은 값을 쓰고, 컷은 박자 격자(120BPM이면 0.5초)에 올린다.
"""
import os
import wave

import numpy as np

SR = 48000
_rng = np.random.default_rng(7)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return _rng.standard_normal(int(d * SR))


def band(x, lo=0.0, hi=None):
    """FFT 밴드패스(부드러운 경계)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo > 0:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def lp_sweep(x, f0, f1):
    """컷오프가 f0→f1로 지수적으로 움직이는 1차 로우패스(라이저·휙 소리용)."""
    fc = f0 * (f1 / f0) ** np.linspace(0, 1, len(x))
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    z = 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z
        y[i] = z
    return y


NOTE = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}


def hz(name, octave):
    return NOTE[name] * 2 ** (octave - 4)


CHORDS = {
    "C": [("C", 3), ("G", 3), ("C", 4), ("E", 4), ("G", 4)],
    "G": [("G", 2), ("D", 3), ("G", 3), ("B", 3), ("D", 4)],
    "Am": [("A", 2), ("E", 3), ("A", 3), ("C", 4), ("E", 4)],
    "F": [("F", 2), ("C", 3), ("F", 3), ("A", 3), ("C", 4)],
    "Dm": [("D", 3), ("A", 3), ("D", 4), ("F", 4), ("A", 4)],
    "Em": [("E", 2), ("B", 2), ("E", 3), ("G", 3), ("B", 3)],
}
ROOT = {"C": hz("C", 2), "G": hz("G", 1), "Am": hz("A", 1), "F": hz("F", 1), "Dm": hz("D", 2), "Em": hz("E", 1)}
ARP = {"C": "C E G D", "G": "G B D A", "Am": "A C E G", "F": "F A C G", "Dm": "D F A C", "Em": "E G B D"}


# ---------- 악기 ----------
def kick(big=False):
    t = tt(0.55 if big else 0.4)
    f = 46 + (140 if big else 120) * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.3 if big else 0.15))
    return np.tanh(s * 1.5)


def clap():
    t = tt(0.25)
    s = band(noise(0.25), 1000, 6000)
    e = np.exp(-t / 0.07)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        e[i:] += 0.6 * np.exp(-t[: len(t) - i] / 0.007)
    return s * e * 0.5


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    return band(noise(d), 7500) * np.exp(-tt(d) / (0.06 if open_ else 0.014))


def bass(f, d=0.45):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return np.tanh(s * 1.3) * np.exp(-t / 0.25) * np.minimum(1, t / 0.005)


def _saw(f, t, detune=0.0):
    return 2 * ((f * (1 + detune) * t) % 1.0) - 1


def pad(chord, d):
    t = tt(d)
    s = np.zeros_like(t)
    for n, o in CHORDS[chord]:
        f = hz(n, o)
        s += _saw(f, t, -0.004) + _saw(f, t, 0.005)
    s = band(s, 80, 1800) / 7
    return s * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)


def pluck(f, d=0.4):
    t = tt(d)
    s = band(np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t), 200, 4000)
    return s * np.exp(-t / 0.12) * np.minimum(1, t / 0.003)


def pop(f=900, d=0.12):
    t = tt(d)
    fr = f * (1 + 0.6 * np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.04) * np.minimum(1, t / 0.001)


def tick():
    t = tt(0.03)
    return (np.sin(2 * np.pi * 2600 * t) + 0.5 * np.sin(2 * np.pi * 4100 * t)) * np.exp(-t / 0.005)


def click():
    """타자기 한 글자."""
    t = tt(0.012)
    return band(noise(0.012), 1800, 7000) * np.exp(-t / 0.0022)


def bell(freqs, d=2.5, decay=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for f in freqs:
        for mult, amp, dk in ((1, 1, 1), (2.0, 0.3, 0.6), (3.01, 0.12, 0.35)):
            s += amp * np.sin(2 * np.pi * f * mult * t) * np.exp(-t / (decay * dk))
    return s * np.minimum(1, t / 0.004) / len(freqs)


def whoosh(d=0.6, f0=400, f1=7000):
    t = tt(d)
    return lp_sweep(noise(d), f0, f1) * np.sin(np.pi * t / d) ** 2 * 2.0


def riser(d):
    t = tt(d)
    s = lp_sweep(noise(d), 300, 9000) * (t / d) ** 2.2 * 2.0
    return s + np.sin(2 * np.pi * np.cumsum(330 * (3 ** (t / d))) / SR) * (t / d) ** 3 * 0.15


def impact():
    t = tt(1.4)
    s = np.sin(2 * np.pi * (42 + 40 * np.exp(-t / 0.07)) * t) * np.exp(-t / 0.5) * 0.9
    s += band(noise(1.4), 400, 9000) * np.exp(-t / 0.35) * 0.3
    k = kick(True)
    s[: len(k)] += k * 0.7
    return s


def thud():
    t = tt(0.25)
    return np.sin(2 * np.pi * (70 + 60 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.08)


def glitch():
    t = tt(0.09)
    seg = len(t) // 4
    s = np.zeros_like(t)
    for k, f in enumerate(_rng.choice([180, 330, 660, 1250, 2400], size=4)):
        sl = slice(k * seg, (k + 1) * seg)
        s[sl] = np.sign(np.sin(2 * np.pi * f * t[sl]))
    return s * np.exp(-t / 0.05) * 0.25


# ---------- 믹서 ----------
class Mix:
    def __init__(self, dur):
        self.dur = dur
        self.n = int(SR * dur)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)
        self.REV = np.zeros(self.n)

    def place(self, sig, t, gain=1.0, pan=0.0, rev=0.0):
        """t초에 sig를 놓는다. pan -1(왼)..1(오), rev는 리버브로 보낼 양."""
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), self.n - i)
        if n <= 0:
            return
        s = sig[:n] * gain
        self.L[i:i + n] += s * np.sqrt(0.5 * (1 - pan))
        self.R[i:i + n] += s * np.sqrt(0.5 * (1 + pan))
        self.REV[i:i + n] += s * rev

    def beat_bed(self, start, end, bpm=120, progression=("C", "G", "Am", "F"), level=1.0):
        """킥(정박)·클랩(2·4박)·하이햇(엇박)·베이스·아르페지오·패드로 된 기본 비트를 깐다."""
        beat = 60 / bpm
        bar = beat * 4
        for j, b in enumerate(np.arange(start, end - 1e-6, beat)):
            ch = progression[int((b - start) // bar) % len(progression)]
            self.place(kick(), b, 0.75 * level)
            self.place(bass(ROOT[ch]), b, 0.4 * level)
            self.place(hat(open_=(j % 4 == 3)), b + beat / 2, 0.18 * level, pan=0.25)
            if j % 2 == 1:
                self.place(clap(), b, 0.35 * level, rev=0.25)
            for k in range(2):
                nt = ARP[ch].split()[(j * 2 + k) % 4]
                self.place(pluck(hz(nt, 5), 0.3), b + k * beat / 2, 0.09 * level, pan=0.4 * (1 if k else -1), rev=0.2)
        for bt in np.arange(start, end - 1e-6, bar):
            ch = progression[int((bt - start) // bar) % len(progression)]
            self.place(pad(ch, min(bar, end - bt) + 0.25), bt, 0.22 * level, rev=0.25)

    def write(self, path, peak=0.89, fade_out=0.8):
        ir_t = tt(1.6)
        ir = band(_rng.standard_normal(len(ir_t)), 250, 7000) * np.exp(-ir_t / 0.4)
        ir /= np.sqrt(np.sum(ir ** 2))
        size = 1 << int(np.ceil(np.log2(self.n + len(ir))))
        wet = np.fft.irfft(np.fft.rfft(self.REV, size) * np.fft.rfft(ir, size), size)[: self.n] * 0.6
        dl = int(0.013 * SR)
        L = self.L + wet
        R = self.R.copy()
        R[dl:] += wet[:-dl]
        mix = np.tanh(np.stack([L, R], axis=1) * 1.05)
        fade = np.ones(self.n)
        fi = int(0.02 * SR)
        fade[:fi] = np.linspace(0, 1, fi)
        fo = int(fade_out * SR)
        fade[-fo:] = np.linspace(1, 0, fo) ** 2
        mix *= fade[:, None]
        mix /= max(1e-9, np.max(np.abs(mix))) / peak
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        with wave.open(path, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((mix * 32767).astype("<i2").tobytes())
        return path
