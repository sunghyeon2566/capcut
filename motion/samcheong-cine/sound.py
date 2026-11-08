"""삼청동수제비 시네마 광고 사운드 — 레퍼런스와 같은 125BPM, 앞 절반은 잔잔하게, 쇼케이스(15.36초)부터 힘 있게.
레퍼런스 음악을 쓰지 않고 새로 합성한 가이드 트랙이다.

    python3 sound.py      # out/sound.wav

시각은 index.html 의 컷 시각(4박 = 1.92초 단위)과 같다.
"""
import numpy as np

from sound_kit import (SR, Mix, band, bell, impact, noise, pad, pop, riser, thud, tt, whoosh, hz)

DUR = 30.0
BEAT = 60 / 125
b = lambda n: round(n * BEAT, 3)
DROP, END = b(32), b(55)
rng = np.random.default_rng(7)


def sizzle(d):
    """볶음 지글지글 (쭈꾸미 컷)"""
    n = int(d * SR)
    s = band(noise(d), 2500, 11000) * 0.16 * (0.7 + 0.3 * np.sin(np.arange(n) / SR * 2 * np.pi * 3.1))
    for _ in range(int(d * 26)):
        i = int(rng.uniform(0, n - 2000))
        L = int(rng.uniform(80, 500))
        s[i:i + L] += band(rng.standard_normal(L), 1500, 9000) * np.exp(-np.arange(L) / (L * 0.25)) * rng.uniform(0.2, 0.7)
    fade = np.minimum(1, np.minimum(np.arange(n) / (0.3 * SR), (n - np.arange(n)) / (0.4 * SR)))
    return s * fade


def simmer(d):
    """보글보글 끓는 소리 (항아리 컷)"""
    n = int(d * SR)
    s = band(noise(d), 200, 1200) * 0.05
    for _ in range(int(d * 9)):
        i = int(rng.uniform(0, n - 3000))
        L = int(rng.uniform(900, 2500))
        f = rng.uniform(300, 700)
        tt_ = np.arange(L) / SR
        s[i:i + L] += np.sin(2 * np.pi * f * tt_ * (1 + 2.5 * tt_)) * np.exp(-tt_ / 0.02) * 0.25
    fade = np.minimum(1, np.minimum(np.arange(n) / (0.4 * SR), (n - np.arange(n)) / (0.5 * SR)))
    return s * fade


m = Mix(DUR)
# 음악: 잔잔한 앞부분 → 쇼케이스에서 힘 있게 → 엔딩은 화음으로 마무리
m.place(pad("Am", b(32)), 0.0, 0.22, rev=0.4)
m.beat_bed(b(8), DROP, bpm=125, progression=("Am", "F", "C", "G"), level=0.38)
m.beat_bed(DROP, END, bpm=125, progression=("F", "G", "Am", "Am"), level=0.82)
m.place(pad("C", DUR - END), END, 0.26, rev=0.45)

# 오프닝
m.place(riser(0.8), 0.0, 0.18, rev=0.3)
m.place(bell([hz("A", 4), hz("E", 5), hz("C", 6)], d=3.0, decay=1.2), 0.7, 0.28, rev=0.5)
m.place(simmer(3.6), 0.1, 0.35)
# 앞부분 컷마다 아주 작은 숨소리 같은 휙
for n in (8, 12, 16, 20, 22.5, 28):
    m.place(whoosh(0.35, 600, 4000), b(n) - 0.12, 0.08, pan=0.2 * np.sin(n))
m.place(simmer(2.4), b(22.5), 0.25)
# 드롭(쇼케이스)
m.place(riser(1.0), DROP - 1.0, 0.32, rev=0.3)
m.place(impact(), DROP, 0.5, rev=0.35)
m.place(sizzle(1.4), DROP, 0.4)
m.place(pop(900), DROP + 0.3, 0.16, pan=0.4, rev=0.25)
m.place(thud(), b(35), 0.3)
m.place(pop(1050), b(35) + 0.3, 0.16, pan=0.4, rev=0.25)
m.place(sizzle(2.8), b(38), 0.35)
m.place(simmer(1.9), b(44), 0.22)
# 엔딩
m.place(whoosh(0.7, 3000, 300), END - 0.4, 0.22)
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("C", 6)], d=3.6, decay=1.4), END + 0.1, 0.4, rev=0.45)
m.place(bell([hz("G", 5), hz("D", 6)], d=2.0), END + 1.3, 0.2, rev=0.45)
m.write("out/sound.wav", peak=0.8, fade_out=1.5)
print("out/sound.wav")
