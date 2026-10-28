"""서울시청 컨셉 필름 사운드 — 120BPM 위에 컷 임팩트, 타자음, 시계 초침, 지하철 차임을 합성한다.

    python3 sound.py            # out/sound.wav (48kHz, 16bit, 스테레오)

numpy만 쓴다. 타임라인 값은 index.html의 T와 같아야 한다.
"""
import os
import wave

import numpy as np

SR = 48000
DUR = 26.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)

T = {
    "intro": 0.0, "mission": 3.5, "title": 6.0, "open": 7.5, "listen": 8.5,
    "connect": 9.5, "districts": 10.5, "tunnel": 11.5, "act": 14.5,
    "spaces": 16.0, "stack": 19.0, "flip": 21.0, "lockup": 22.5,
}
CUTS = [v for v in T.values() if v > 0]

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
    """컷오프가 f0→f1로 지수적으로 올라가는 1차 로우패스."""
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


# ---------- 악기 ----------
def kick(big=False):
    t = tt(0.6 if big else 0.42)
    f = 44 + (140 if big else 110) * np.exp(-t / 0.032)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.32 if big else 0.17))
    s += noise(t[-1] + 1 / SR)[: len(t)] * np.exp(-t / 0.0025) * 0.25
    return np.tanh(s * 1.6)


def hat(open_=False):
    d = 0.16 if open_ else 0.045
    t = tt(d)
    return band(noise(d), 7000) * np.exp(-t / (0.05 if open_ else 0.012))


def snap():
    t = tt(0.22)
    s = band(noise(0.22), 1400, 5200)
    e = np.exp(-t / 0.055)
    for k, off in enumerate((0.0, 0.009, 0.018)):
        i = int(off * SR)
        e[i:] += 0.5 * np.exp(-(t[: len(t) - i]) / 0.006) * (k < 2)
    return s * e * 0.6


def click():
    d = 0.012
    t = tt(d)
    return band(noise(d), 1800, 7000) * np.exp(-t / 0.0022) + np.sin(2 * np.pi * rng.uniform(2200, 3200) * t) * np.exp(-t / 0.002) * 0.3


def tick():
    t = tt(0.05)
    return (np.sin(2 * np.pi * 3100 * t) + 0.6 * np.sin(2 * np.pi * 5200 * t)) * np.exp(-t / 0.006)


def blip(freq=980, d=0.09):
    t = tt(d)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.03) * np.minimum(1, t / 0.002)


def bell(freqs, d=3.2, decay=1.1):
    t = tt(d)
    s = np.zeros_like(t)
    for f in freqs:
        for mult, amp, dk in ((1, 1, 1), (2.76, 0.35, 0.45), (5.4, 0.12, 0.25)):
            s += amp * np.sin(2 * np.pi * f * mult * t) * np.exp(-t / (decay * dk))
    return s * np.minimum(1, t / 0.004) / len(freqs)


def impact(big=True):
    d = 1.6
    t = tt(d)
    boom = np.sin(2 * np.pi * (38 + 30 * np.exp(-t / 0.08)) * t) * np.exp(-t / 0.7)
    crash = band(noise(d), 300, 9000) * np.exp(-t / (0.45 if big else 0.2))
    s = boom * 0.9 + crash * 0.35
    s[: len(kick(True))] += kick(True) * 0.8
    return s


def glitch_burst():
    d = 0.09
    t = tt(d)
    f = rng.choice([180, 330, 660, 1250, 2400], size=4)
    seg = len(t) // 4
    s = np.zeros_like(t)
    for k in range(4):
        sl = slice(k * seg, (k + 1) * seg)
        s[sl] = np.sign(np.sin(2 * np.pi * f[k] * t[sl]))
    return s * np.exp(-t / 0.05) * 0.25


def riser(d, f0=250, f1=9000):
    t = tt(d)
    s = lp_sweep(noise(d), f0, f1)
    s *= (t / d) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 * (4 ** (t / d))) / SR) * (t / d) ** 3 * 0.15
    return s * 2.4 + tone


def whoosh(d=0.5):
    t = tt(d)
    s = lp_sweep(noise(d), 400, 6000)
    return s * np.sin(np.pi * t / d) ** 2 * 2.2


def saw(f, t, detune=0.0):
    ph = (f * (1 + detune) * t) % 1.0
    return 2 * ph - 1


NOTE = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}


def hz(name, octave):
    return NOTE[name] * 2 ** (octave - 4)


CHORDS = {
    "Am": [("A", 2), ("E", 3), ("G", 3), ("C", 4), ("E", 4)],
    "F": [("F", 2), ("C", 3), ("E", 3), ("A", 3), ("C", 4)],
    "C": [("C", 3), ("G", 3), ("B", 3), ("E", 4), ("G", 4)],
    "G": [("G", 2), ("D", 3), ("F#", 3), ("B", 3), ("D", 4)],
}
ROOT = {"Am": hz("A", 1), "F": hz("F", 1), "C": hz("C", 2), "G": hz("G", 1)}


def pad(chord, d, gain=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for n, o in CHORDS[chord]:
        f = hz(n, o)
        s += saw(f, t, -0.004) + saw(f, t, 0.005)
    s = band(s, 60, 1400) / 6
    env = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.35)
    return s * env * gain


def bass_note(f, d=0.42):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return np.tanh(s * 1.4) * np.exp(-t / 0.22) * np.minimum(1, t / 0.006)


# ---------- 타임라인 ----------
# 인트로: 드론 + CRT 켜짐 + 시계 초침
t = tt(6.2)
drone = (np.sin(2 * np.pi * hz("A", 1) * t) + 0.5 * np.sin(2 * np.pi * hz("E", 2) * t * 1.002)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t))
drone *= np.minimum(1, t / 1.5) * np.minimum(1, (6.2 - t) / 0.4)
place(drone, 0.0, 0.18)
zt = tt(0.45)
zap = np.sin(2 * np.pi * np.cumsum(60 * (70 ** (zt / 0.45))) / SR) * np.exp(-zt / 0.18) + band(noise(0.45), 2000) * np.exp(-zt / 0.05) * 0.4
place(zap, 0.05, 0.35, rev=0.2)

# 시계 바늘이 감기며 째깍 — 분침 각도가 30°를 지날 때마다
def ease_out_cubic(k):
    return 1 - (1 - k) ** 3


prev = None
for i in range(int(1.35 * SR / 64)):
    tl = 1.0 + i * 64 / SR
    k = min(1, (tl - 1.0) / 1.35)
    ang = (1 - ease_out_cubic(k)) * 2 * np.pi * 1.5
    step = int(ang / (np.pi / 6))
    if prev is not None and step != prev:
        place(tick(), tl, 0.32, pan=0.2 * np.sin(step), rev=0.15)
    prev = step
place(whoosh(0.5), 2.35, 0.25, rev=0.3)
place(whoosh(0.4), 3.05, 0.2)

# 타자음
def typing(t0, text, cps, gain=0.22):
    for i, ch in enumerate(text):
        if ch != " ":
            place(click(), t0 + (i + 1) / cps, gain * rng.uniform(0.7, 1.1), pan=rng.uniform(-0.3, 0.3))


typing(0.75, "open seoul-city-hall", 17)
place(blip(1320, 0.12), 2.05, 0.18)  # [ ok ]
l1, l2 = "광장을 열고. 도서관을 밝히고.", "시민의 목소리를 가장 먼저 듣습니다."
t1 = T["mission"] + 0.35
t2 = t1 + len(l1) / 22 + 0.12
typing(t1, l1, 22)
typing(t2, l2, 22)
for b in (0.75, 2.2):
    place(blip(760, 0.07), T["mission"] + b, 0.12)
for i, ko in enumerate(["서울광장", "서울도서관", "시민청", "하늘광장"]):
    typing(T["spaces"] + 0.7 + i * 0.32, ko, 16, 0.25)
typing(T["lockup"] + 0.75, "seoul.go.kr", 22, 0.2)

# 미션: 심장박동 같은 낮은 펄스 + 타이틀 전 라이저
for b in np.arange(T["mission"], T["title"], BEAT):
    place(kick(), b, 0.35)
place(pad("Am", T["title"] - T["mission"] + 0.4), T["mission"], 0.35)
place(riser(1.0), T["title"] - 1.0, 0.45)

# 비트 구간(타이틀 → 플립): 킥, 오프비트 하이햇, 2·4박 스냅, 베이스, 코드
prog_ = ["Am", "F", "C", "G"]
beats = np.arange(T["title"], T["flip"], BEAT)
for j, b in enumerate(beats):
    bar = int((b - T["title"]) // 2.0)
    ch = prog_[bar % 4]
    in_tunnel = T["tunnel"] <= b < T["act"]
    place(kick(), b, 0.8)
    place(bass_note(ROOT[ch]), b + (0.25 if j % 4 == 3 else 0.0), 0.42)
    if b >= T["open"]:
        place(hat(open_=(j % 4 == 3)), b + 0.25, 0.22 if not in_tunnel else 0.3, pan=0.25)
        if in_tunnel:
            place(hat(), b + 0.125, 0.12, pan=-0.25)
            place(hat(), b + 0.375, 0.12, pan=-0.25)
    if j % 2 == 1 and b >= T["listen"]:
        place(snap(), b, 0.4, rev=0.25)
for bar_t in np.arange(T["title"], T["flip"], 2.0):
    ch = prog_[int((bar_t - T["title"]) // 2.0) % 4]
    place(pad(ch, min(2.0, T["flip"] - bar_t) + 0.3), bar_t, 0.32, rev=0.2)

# 컷마다 글리치, 큰 장면 전환엔 임팩트
for c in CUTS:
    place(glitch_burst(), c - 0.02, 0.5, pan=rng.uniform(-0.5, 0.5))
for c in (T["title"], T["tunnel"], T["act"]):
    place(impact(), c, 0.55, rev=0.35)
place(whoosh(0.35), T["open"] - 0.3, 0.2)

# 터널: 역 이름이 넘어갈 때마다 틱, 도착하면 두 음 차임, 노선 배지 팝, 도착 라이저
stations = 7
prev = 0
for i in range(int(1.25 * SR / 64)):
    lt = i * 64 / SR
    idx = min(stations - 1, int(ease_out_cubic(min(1, lt / 1.25)) * (stations - 0.001)))
    if idx != prev:
        place(tick(), T["tunnel"] + lt, 0.35, pan=-0.3)
        prev = idx
place(bell([hz("E", 5)], 1.4, 0.5), T["tunnel"] + 1.25, 0.32, rev=0.3)
place(bell([hz("C", 5)], 1.6, 0.6), T["tunnel"] + 1.5, 0.32, rev=0.3)
place(blip(880, 0.1), T["tunnel"] + 1.45, 0.2, pan=0.5)
place(blip(1175, 0.1), T["tunnel"] + 1.57, 0.2, pan=0.6)
place(riser(T["act"] - T["tunnel"] - 0.4, 200, 11000), T["tunnel"] + 0.4, 0.32)

# 움직이다: 블록이 모이는 소리
for k in range(10):
    place(glitch_burst(), T["act"] + 0.1 + k * 0.08, 0.18, pan=rng.uniform(-0.6, 0.6))
place(blip(660, 0.08), T["act"] + 1.0, 0.15)

# 공간·선언: 눈 깜빡임 블립
for b in (1.0, 2.5):
    place(blip(820, 0.07), T["spaces"] + b, 0.12)

# 플립 → 로크업: 큰 임팩트, 마크가 쓸고 들어오는 휙, 해결 화음(C)
place(impact(), T["flip"], 0.7, rev=0.45)
place(whoosh(0.6), T["flip"] + 0.75, 0.35)
place(pad("C", DUR - T["lockup"] + 0.2, 1.0), T["lockup"] - 0.1, 0.3, rev=0.3)
place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 3.4, 1.2), T["lockup"], 0.5, rev=0.4)
place(bass_note(hz("C", 2), 1.2), T["lockup"], 0.45)
place(blip(1046, 0.08), T["lockup"] + 1.25, 0.12)

# ---------- 리버브 · 마스터 ----------
ir_t = tt(1.8)
ir = band(rng.standard_normal(len(ir_t)), 200, 6000) * np.exp(-ir_t / 0.45)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << int(np.ceil(np.log2(N + len(ir))))
wet = np.fft.irfft(np.fft.rfft(REV, size) * np.fft.rfft(ir, size), size)[:N] * 0.6
dl = int(0.011 * SR)
L += wet
R[dl:] += wet[:-dl]

mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.1)
fade = np.ones(N)
fade[: int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
fo = int(0.6 * SR)
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
