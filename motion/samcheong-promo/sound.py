"""삼청동수제비 홍보 모션 사운드 — 120BPM 비트 + 전환·팝·타자·종소리, 미슐랭 도장 쾅.
나레이션을 따로 얹을 수 있게 비트는 조금 낮게 깐다.

    python3 sound.py      # out/sound.wav

시각은 index.html 의 T 와 같다.
"""
import numpy as np

from sound_kit import (SR, Mix, band, bell, click, impact, noise, pad, pop, riser, thud, tick, tt, whoosh, hz)

DUR = 55.0
T = {"hook": 0.0, "scan": 3.0, "seal": 5.5, "tilt": 8.5, "pot": 11.0, "menu": 14.0, "reviews": 19.5,
     "jjuk": 28.0, "montage": 32.0, "store": 37.5, "map": 42.0, "end": 49.0}
rng = np.random.default_rng(31)


def sizzle(d):
    """숯불 위 고기 굽는 소리: 지글지글 + 탁탁"""
    n = int(d * SR)
    s = band(noise(d), 2500, 11000) * 0.18 * (0.7 + 0.3 * np.sin(np.arange(n) / SR * 2 * np.pi * 3.1))
    for _ in range(int(d * 30)):
        i = int(rng.uniform(0, n - 2000))
        L = int(rng.uniform(80, 500))
        s[i:i + L] += band(rng.standard_normal(L), 1500, 9000) * np.exp(-np.arange(L) / (L * 0.25)) * rng.uniform(0.2, 0.8)
    fade = np.minimum(1, np.minimum(np.arange(n) / (0.3 * SR), (n - np.arange(n)) / (0.4 * SR)))
    return s * fade


def ping(f=1320, d=1.2):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.003)


def shimmer(d=0.8):
    t = tt(d)
    return band(noise(d), 4000, 12000) * np.sin(np.pi * t / d) ** 2 * 0.6


m = Mix(DUR)
LV = 0.6   # 나레이션 자리를 위해 비트를 낮게
m.beat_bed(0.5, T["reviews"], bpm=120, progression=("F", "C", "G", "Am"), level=LV)
m.beat_bed(T["reviews"], T["jjuk"], bpm=120, progression=("Am", "F", "C", "G"), level=LV * 0.6)
m.beat_bed(T["jjuk"], T["store"], bpm=120, progression=("F", "G", "C", "C"), level=LV * 1.05)
m.beat_bed(T["store"], T["end"], bpm=120, progression=("Am", "F", "C", "G"), level=LV * 0.7)

m.place(riser(0.6), 0.0, 0.2, rev=0.2)
m.place(pop(700), 0.3, 0.2, rev=0.2)
m.place(whoosh(0.7, 300, 5000), 0.95, 0.35, pan=0.4)
m.place(riser(0.6), 2.4, 0.35, rev=0.2)
m.place(impact(), T["scan"], 0.4, rev=0.3)
m.place(shimmer(1.2), T["scan"] + 0.2, 0.25, rev=0.3)
for i, at in enumerate((0.9, 1.1, 1.3, 1.5)):
    m.place(pop(900 + i * 150), T["scan"] + at, 0.22, pan=(-1) ** i * 0.4, rev=0.2)
m.place(whoosh(0.5), T["seal"] - 0.3, 0.3, pan=-0.3)
m.place(riser(0.45), T["seal"] + 0.15, 0.25, rev=0.2)            # 도장이 내려온다
m.place(impact(), T["seal"] + 0.6, 0.55, rev=0.35)                # 쾅
m.place(thud(), T["seal"] + 0.6, 0.5)
m.place(shimmer(1.0), T["seal"] + 0.65, 0.3, rev=0.35)
m.place(bell([hz("C", 6), hz("G", 6)], d=1.6), T["seal"] + 0.7, 0.25, rev=0.4)
m.place(pop(1100), T["seal"] + 1.75, 0.22, pan=-0.3, rev=0.2)
for at, pan in ((T["tilt"], 0.3), (T["pot"], -0.3), (T["menu"], 0.4)):
    m.place(whoosh(0.45, 500, 7000), at - 0.3, 0.32, pan=pan)
    m.place(thud(), at, 0.3)
m.place(pop(1000), T["tilt"] + 0.9, 0.24, rev=0.2)
for i in range(5):   # 재료 배지 다섯
    m.place(pop(1000 + i * 90), T["pot"] + 1.3 + i * 0.12, 0.18, pan=-0.4 + i * 0.2, rev=0.2)
for k in range(10):
    m.place(tick(), T["menu"] + 0.9 + k * 0.16, 0.1, pan=-0.2)
m.place(whoosh(0.6, 300, 4000), T["menu"] + 2.6, 0.26)
m.place(pop(900), T["menu"] + 3.2, 0.22, pan=0.3, rev=0.2)
m.place(pop(1100), T["menu"] + 3.8, 0.22, pan=0.3, rev=0.2)
m.place(riser(0.7), T["reviews"] - 0.7, 0.3, rev=0.3)
m.place(impact(), T["reviews"], 0.28, rev=0.35)
for k in range(int(3.2 * 12)):
    m.place(click(), T["reviews"] + 0.6 + k / 12, 0.2, pan=0.2 * np.sin(k))
m.place(whoosh(0.6, 300, 4000), T["reviews"] + 4.0, 0.26)
m.place(pop(1050), T["reviews"] + 4.7, 0.26, pan=-0.3, rev=0.25)
m.place(pop(1250), T["reviews"] + 5.3, 0.26, pan=0.3, rev=0.25)
m.place(bell([hz("E", 5), hz("B", 5)], d=1.6), T["reviews"] + 6.1, 0.25, rev=0.35)
m.place(shimmer(0.8), T["jjuk"] - 0.4, 0.3, rev=0.3)
m.place(whoosh(0.6, 300, 5000), T["jjuk"], 0.3, pan=-0.3)
for at in (1.0, 2.6):
    m.place(ping(1046), T["jjuk"] + at, 0.18, rev=0.5)
for i, at in enumerate((1.3, 1.8, 2.3)):
    m.place(pop(950 + i * 120), T["jjuk"] + at, 0.2, pan=(-1) ** i * 0.4, rev=0.2)
m.place(whoosh(0.8, 200, 3500), T["montage"], 0.35)
for i in range(5):
    m.place(pop(800 + i * 120), T["montage"] + 0.15 + abs(i - 2) * 0.12, 0.14, pan=(i - 2) * 0.3, rev=0.2)
m.place(whoosh(0.5), T["montage"] + 3.0, 0.26)
m.place(shimmer(0.8), T["store"] - 0.45, 0.4, pan=-0.2, rev=0.3)
m.place(whoosh(0.6, 400, 6000), T["store"], 0.3, pan=0.4)
m.place(shimmer(1.0), T["store"] + 1.0, 0.25, rev=0.3)
m.place(whoosh(0.5), T["map"] - 0.3, 0.3, pan=0.4)
m.place(thud(), T["map"] + 1.25, 0.4)
for at in (1.4, 2.1, 2.8):
    m.place(ping(1046), T["map"] + at, 0.18, rev=0.5)
m.place(whoosh(0.7, 3000, 300), T["end"] - 0.6, 0.3)
m.place(impact(), T["end"] + 0.2, 0.38, rev=0.35)
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("C", 6)], d=4.0, decay=1.4), T["end"] + 0.5, 0.45, rev=0.4)
m.place(pad("C", DUR - T["end"]), T["end"], 0.24, rev=0.35)
m.place(pop(880), T["end"] + 1.4, 0.18, rev=0.3)
m.write("out/sound.wav", peak=0.8, fade_out=1.2)
print("out/sound.wav")
