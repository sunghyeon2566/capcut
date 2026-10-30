"""딥마크온 무료 특강 모션 사운드 — 밝은 120BPM 비트 위에 전환·팝·카운터 효과음을 합성한다.

    python3 sound.py            # out/sound.wav (48kHz, 16bit, 스테레오)

numpy만 쓴다. 타임라인 값은 index.html의 T와 같아야 한다.
"""
import os
import wave

import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(11)

T = {"open": 0.0, "check": 3.0, "how": 8.0, "record": 13.0, "compare": 17.0, "take": 21.0, "cta": 25.5}
LOGO_END = T["cta"] + 2.5

L = np.zeros(N)
R = np.zeros(N)
REV = np.zeros(N)


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(sig, t, gain=1.0, pan=0.0, rev=0.0):
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    if n <= 0:
        return
    s = sig[:n] * gain
    L[i:i + n] += s * np.sqrt(0.5 * (1 - pan))
    R[i:i + n] += s * np.sqrt(0.5 * (1 + pan))
    REV[i:i + n] += s * rev


def band(x, lo=0.0, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo > 0:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def lp_sweep(x, f0, f1):
    fc = f0 * (f1 / f0) ** np.linspace(0, 1, len(x))
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    z = 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z
        y[i] = z
    return y


def noise(d):
    return rng.standard_normal(int(d * SR))


NOTE = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}


def hz(name, octave):
    return NOTE[name] * 2 ** (octave - 4)


# ---------- 악기 ----------
def kick():
    t = tt(0.4)
    f = 48 + 120 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.15)
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
    t = tt(d)
    return band(noise(d), 7500) * np.exp(-t / (0.06 if open_ else 0.014))


def pluck(f, d=0.4):
    t = tt(d)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t)
    s = band(s, 200, 4000)
    return s * np.exp(-t / 0.12) * np.minimum(1, t / 0.003)


def saw(f, t, detune=0.0):
    ph = (f * (1 + detune) * t) % 1.0
    return 2 * ph - 1


CHORDS = {
    "C": [("C", 3), ("G", 3), ("C", 4), ("E", 4), ("G", 4)],
    "G": [("G", 2), ("D", 3), ("G", 3), ("B", 3), ("D", 4)],
    "Am": [("A", 2), ("E", 3), ("A", 3), ("C", 4), ("E", 4)],
    "F": [("F", 2), ("C", 3), ("F", 3), ("A", 3), ("C", 4)],
}
ROOT = {"C": hz("C", 2), "G": hz("G", 1), "Am": hz("A", 1), "F": hz("F", 1)}
ARP = {
    "C": ["C", "E", "G", "D"], "G": ["G", "B", "D", "A"],
    "Am": ["A", "C", "E", "G"], "F": ["F", "A", "C", "G"],
}


def pad(chord, d):
    t = tt(d)
    s = np.zeros_like(t)
    for n, o in CHORDS[chord]:
        f = hz(n, o)
        s += saw(f, t, -0.004) + saw(f, t, 0.005)
    s = band(s, 80, 1800) / 7
    return s * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)


def bass(f, d=0.45):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return np.tanh(s * 1.3) * np.exp(-t / 0.25) * np.minimum(1, t / 0.005)


def pop(f=900, d=0.12):
    t = tt(d)
    fr = f * (1 + 0.6 * np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.04) * np.minimum(1, t / 0.001)


def tick():
    t = tt(0.03)
    return (np.sin(2 * np.pi * 2600 * t) + 0.5 * np.sin(2 * np.pi * 4100 * t)) * np.exp(-t / 0.005)


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
    s += np.sin(2 * np.pi * np.cumsum(330 * (3 ** (t / d))) / SR) * (t / d) ** 3 * 0.15
    return s


def impact():
    t = tt(1.4)
    boom = np.sin(2 * np.pi * (42 + 40 * np.exp(-t / 0.07)) * t) * np.exp(-t / 0.5)
    crash = band(noise(1.4), 400, 9000) * np.exp(-t / 0.35)
    s = boom * 0.9 + crash * 0.3
    k = kick()
    s[: len(k)] += k * 0.7
    return s


def thud():
    t = tt(0.25)
    return np.sin(2 * np.pi * (70 + 60 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.08)


def buzz():
    t = tt(0.12)
    return np.sign(np.sin(2 * np.pi * 140 * t)) * np.exp(-t / 0.04) * 0.25


# ---------- 인트로(0–3초): 패드 + 반짝이는 플럭, 로고 차임 ----------
place(pad("C", 3.2), 0.0, 0.25, rev=0.3)
place(riser(0.4), 0.0, 0.25)
place(bell([hz("C", 5), hz("G", 5)], 2.0, 0.8), 0.18, 0.3, rev=0.4)
place(whoosh(0.5, 600, 8000), 0.45, 0.2, pan=0.3)
for i, n in enumerate(["C", "E", "G", "C", "E", "G"]):
    place(pluck(hz(n, 5 if i < 3 else 6), 0.5), 0.9 + i * 0.125, 0.18, pan=(i % 2) * 0.5 - 0.25, rev=0.3)

# ---------- 비트(3초 → 로고 엔딩 전) ----------
prog_ = ["C", "G", "Am", "F"]
for j, b in enumerate(np.arange(T["check"], LOGO_END, BEAT)):
    bar = int((b - T["check"]) // 2.0)
    ch = prog_[bar % 4]
    place(kick(), b, 0.75)
    place(bass(ROOT[ch]), b, 0.4)
    place(hat(open_=(j % 4 == 3)), b + 0.25, 0.18, pan=0.25)
    if j % 2 == 1:
        place(clap(), b, 0.35, rev=0.25)
    for k in range(2):
        nt = ARP[ch][(j * 2 + k) % 4]
        place(pluck(hz(nt, 5), 0.3), b + k * 0.25, 0.09, pan=0.4 * (1 if k else -1), rev=0.2)
for bar_t in np.arange(T["check"], LOGO_END, 2.0):
    ch = prog_[int((bar_t - T["check"]) // 2.0) % 4]
    place(pad(ch, min(2.0, LOGO_END - bar_t) + 0.25), bar_t, 0.22, rev=0.25)

# ---------- 전환 ----------
for at in (T["check"], T["cta"]):  # 사선 띠
    place(whoosh(0.8, 300, 9000), at - 0.45, 0.45, pan=0.4)
    place(impact(), at, 0.35, rev=0.3)
place(riser(0.45), T["record"] - 0.45, 0.4)  # 원 확장
place(impact(), T["record"], 0.55, rev=0.35)
for i in range(6):  # 계단
    place(thud(), T["compare"] - 0.45 + i * 0.07, 0.35)
place(whoosh(0.5), T["take"] - 0.25, 0.3, pan=-0.3)  # 어둡게 넘김
place(whoosh(0.5), T["how"] - 0.2, 0.25, pan=0.3)

# ---------- 장면 효과음 ----------
# CHECK: 선이 그어지는 소리, 마디 팝, 결론
place(whoosh(2.0, 200, 3000), T["check"] + 0.55, 0.15)
xa, xb = 200, 1720
for i, x in enumerate((440, 960, 1480)):
    tn = 0.55 + 2.05 * (1 - (1 - (x - xa) / (xb - xa)) ** (1 / 3))
    place(pop(700 + i * 160), T["check"] + tn, 0.3, pan=-0.4 + i * 0.4)
place(bell([hz("E", 5)], 1.2, 0.5), T["check"] + 3.4, 0.25, rev=0.3)
# HOW: 단계마다 팝 + 화살표 틱
for i in range(4):
    tk = T["how"] + 0.8 + i * 0.72
    place(pop(600 + i * 120), tk, 0.32, pan=-0.45 + i * 0.3)
    if i < 3:
        for j in range(3):
            place(tick(), tk + 0.45 + j * 0.08, 0.15, pan=-0.3 + i * 0.3)
# RECORD: 카운터가 올라가는 동안 틱
for i in range(3):
    k0 = T["record"] + 0.45 + i * 0.22 + 0.2
    for j in range(14):
        place(tick(), k0 + 1.05 * (1 - (1 - j / 14) ** (1 / 3)), 0.12, pan=-0.4 + i * 0.4)
    place(pop(1200, 0.15), k0 + 1.05, 0.2, pan=-0.4 + i * 0.4)
# COMPARE: 왼쪽 줄 긋기(버즈) · 오른쪽 체크(띵)
for i in range(4):
    place(pop(880 + i * 110), T["compare"] + 1.05 + i * 0.22, 0.22, pan=0.4)
    place(buzz(), T["compare"] + 2.1 + i * 0.14, 0.5, pan=-0.4)
place(bell([hz("G", 5)], 1.0, 0.5), T["compare"] + 2.7, 0.2, rev=0.3)
# TAKE: 항목 팝 + 도트 반짝임
for i in range(4):
    place(pop(660 + i * 90), T["take"] + 0.6 + i * 0.4, 0.3, pan=-0.3)
for i in range(10):
    place(pluck(hz(["C", "E", "G", "A", "D"][i % 5], 6), 0.25), T["take"] + 0.6 + i * 0.13, 0.06, pan=0.5, rev=0.3)
# CTA: 날짜 글자 틱, 로고 엔딩 차임
for i in range(15):
    place(tick(), T["cta"] + 0.25 + i * 0.03, 0.1, pan=-0.5 + i / 15)
place(pop(1000, 0.15), T["cta"] + 0.1, 0.3)
place(whoosh(0.4), LOGO_END - 0.3, 0.3)
place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 2.6, 1.1), LOGO_END, 0.45, rev=0.45)
place(pad("C", DUR - LOGO_END), LOGO_END, 0.28, rev=0.35)
place(bass(hz("C", 2), 1.2), LOGO_END, 0.4)

# ---------- 리버브 · 마스터 ----------
ir_t = tt(1.6)
ir = band(rng.standard_normal(len(ir_t)), 250, 7000) * np.exp(-ir_t / 0.4)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << int(np.ceil(np.log2(N + len(ir))))
wet = np.fft.irfft(np.fft.rfft(REV, size) * np.fft.rfft(ir, size), size)[:N] * 0.6
dl = int(0.013 * SR)
L += wet
R[dl:] += wet[:-dl]

mix = np.tanh(np.stack([L, R], axis=1) * 1.05)
fade = np.ones(N)
fi = int(0.02 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fo = int(0.8 * SR)
fade[-fo:] = np.linspace(1, 0, fo) ** 2
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / 0.89

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(out)
