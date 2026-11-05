"""서주골 홍보 모션 사운드 — 따뜻한 120BPM 비트 + 장작 타는 소리 + 전환·팝·타자·종소리.

    python3 sound.py      # out/sound.wav

시각은 index.html 의 T 와 같다.
"""
import numpy as np

from sound_kit import (SR, Mix, band, bell, click, impact, noise, pad, pop, riser, thud, tick, tt, whoosh, hz)

DUR = 49.5
T = {"hook": 0.0, "fire": 3.0, "hang": 5.5, "tilt": 8.5, "menu": 11.0, "sides": 13.5, "gather": 19.0,
     "reserve": 24.0, "reviews": 28.0, "montage": 36.0, "logo": 41.5}
rng = np.random.default_rng(21)


def crackle(d, density=38):
    """장작 타는 소리: 낮은 웅웅거림 + 불규칙한 탁탁"""
    n = int(d * SR)
    s = band(noise(d), 60, 400) * 0.25
    for _ in range(int(d * density)):
        i = int(rng.uniform(0, n - 2000))
        L = int(rng.uniform(80, 600))
        env = np.exp(-np.arange(L) / (L * 0.25))
        s[i:i + L] += band(rng.standard_normal(L), 1500, 9000) * env * rng.uniform(0.3, 1.0)
    fade = np.minimum(1, np.minimum(np.arange(n) / (0.3 * SR), (n - np.arange(n)) / (0.4 * SR)))
    return s * fade


def ping(f=1320, d=1.2):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.003)


def shimmer(d=0.8):
    t = tt(d)
    return band(noise(d), 4000, 12000) * np.sin(np.pi * t / d) ** 2 * 0.6


m = Mix(DUR)
# 비트: 처음 0.5초 뒤부터 리뷰 장면 전까지, 리뷰 장면은 가볍게, 로고에서 멈춤
m.beat_bed(0.5, T["reviews"], bpm=120, progression=("C", "Am", "F", "G"), level=0.8)
m.beat_bed(T["reviews"], T["montage"], bpm=120, progression=("Am", "F", "C", "G"), level=0.45)
m.beat_bed(T["montage"], T["logo"], bpm=120, progression=("F", "G", "C", "C"), level=0.85)

# ① 시작
m.place(riser(0.6), 0.0, 0.25, rev=0.2)
m.place(pop(700), 0.3, 0.22, rev=0.2)
m.place(whoosh(0.7, 300, 5000), 0.95, 0.4, pan=0.4)
m.place(riser(0.6), 2.4, 0.4, rev=0.2)
m.place(impact(), T["fire"], 0.5, rev=0.3)
# ② 장작불
m.place(crackle(2.6), T["fire"], 0.5, rev=0.15)
m.place(bell([hz("E", 5), hz("B", 5)], d=1.6), T["fire"] + 1.9, 0.35, rev=0.35)
# ③ 360°
m.place(whoosh(0.5), T["hang"] - 0.3, 0.35, pan=-0.3)
m.place(thud(), T["hang"], 0.45)
for k in range(16):
    m.place(tick(), T["hang"] + 0.2 + k * 0.075, 0.14, pan=0.2)
m.place(pop(1100), T["hang"] + 1.4, 0.3, pan=-0.3, rev=0.2)
# ④ ⑤ ⑥ 휙휙
for at, pan in ((T["tilt"], 0.3), (T["menu"], -0.3), (T["sides"], 0.4)):
    m.place(whoosh(0.45, 500, 7000), at - 0.3, 0.38, pan=pan)
    m.place(thud(), at, 0.35)
m.place(pop(950), T["menu"] + 1.05, 0.22, rev=0.2)
m.place(pop(1050), T["tilt"] + 1.15, 0.26, pan=0.3, rev=0.2)
m.place(pop(1150), T["menu"] + 1.55, 0.24, pan=-0.3, rev=0.2)
m.place(pop(800), T["sides"] + 4.25, 0.2, rev=0.2)
m.place(whoosh(0.6, 300, 4000), T["sides"] + 2.6, 0.3)
m.place(pop(900), T["sides"] + 3.35, 0.28, pan=0.3, rev=0.2)
m.place(pop(1200), T["sides"] + 3.85, 0.24, pan=0.35, rev=0.2)
# ⑦ 빛줄기 → 모임
m.place(shimmer(0.8), T["gather"] - 0.45, 0.5, pan=-0.2, rev=0.3)
m.place(impact(), T["gather"], 0.35, rev=0.3)
for at in (T["gather"] + 1.2, T["gather"] + 3.0):
    m.place(ping(1046), at, 0.22, rev=0.5)
m.place(pop(1000), T["gather"] + 1.5, 0.22, pan=-0.4, rev=0.2)
m.place(pop(1250), T["gather"] + 2.2, 0.22, pan=0.4, rev=0.2)
# ⑧ 예약: 누르기 + 완료 소리
m.place(whoosh(0.45), T["reserve"] - 0.3, 0.35, pan=0.3)
m.place(click(), T["reserve"] + 1.1, 0.6)
m.place(bell([hz("C", 6), hz("G", 6)], d=1.2), T["reserve"] + 1.35, 0.3, rev=0.3)
m.place(whoosh(0.6, 300, 4000), T["reserve"] + 1.6, 0.3)
m.place(pop(1150), T["reserve"] + 2.3, 0.3, pan=-0.2, rev=0.2)
# ⑨ 하얀 섬광 → 리뷰 타자
m.place(riser(0.7), T["reviews"] - 0.7, 0.35, rev=0.3)
m.place(impact(), T["reviews"], 0.3, rev=0.35)
for k in range(int(2.8 * 12)):
    m.place(click(), T["reviews"] + 0.6 + k / 12, 0.22, pan=0.2 * np.sin(k))
m.place(whoosh(0.6, 300, 4000), T["reviews"] + 4.3, 0.3)
m.place(pop(1050), T["reviews"] + 5.0, 0.3, pan=-0.3, rev=0.25)
# ⑩ 화면 다섯 개
m.place(whoosh(0.8, 200, 3500), T["montage"], 0.4)
for i in range(5):
    m.place(pop(800 + i * 120), T["montage"] + 0.15 + abs(i - 2) * 0.12, 0.16, pan=(i - 2) * 0.3, rev=0.2)
m.place(whoosh(0.5), T["montage"] + 3.2, 0.3)
m.place(whoosh(0.7, 3000, 300), T["logo"] - 0.6, 0.35)
# ⑪ 로고 · 특별 서비스
m.place(impact(), T["logo"] + 0.2, 0.45, rev=0.35)
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("C", 6)], d=4.0, decay=1.4), T["logo"] + 0.5, 0.5, rev=0.4)
m.place(pad("C", DUR - T["logo"]), T["logo"], 0.28, rev=0.35)
m.place(shimmer(1.0), T["logo"] + 2.8, 0.35, rev=0.3)
m.place(bell([hz("G", 5), hz("D", 6)], d=2.5), T["logo"] + 3.1, 0.32, rev=0.4)
m.place(pop(880), T["logo"] + 4.3, 0.2, rev=0.3)
m.write("out/sound.wav", peak=0.8, fade_out=1.2)
print("out/sound.wav")
