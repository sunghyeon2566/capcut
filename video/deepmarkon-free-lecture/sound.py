"""가이드 사운드트랙 — index.html의 T와 같은 시각에 비트·전환음·효과음을 놓는다.

    python3 sound.py        # out/sound.wav

시각은 index.html 의 T(장면 시작)와 장면 안 등장 시각을 그대로 옮겨 적었다.
문구 타이밍을 바꾸면 여기 숫자도 같이 바꾼다.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, bell, click, hz, impact, pad, pluck, pop, riser, thud, tick, whoosh  # noqa: E402

DUR = 39.0
BPM = 120
T = {
    "open": 0.0, "hook": 2.0, "brand": 4.5, "check": 9.0, "method": 14.5,
    "verdict": 19.5, "result": 22.5, "take": 27.5, "free": 32.0, "end": 35.0,
}

m = Mix(DUR)

# ---------- 오프닝: 터지는 소리 + 반짝이, 끝에 빨려 드는 라이저 ----------
m.place(impact(), 0.0, 0.5, rev=0.35)
m.place(pad("C", 2.2), 0.0, 0.18, rev=0.4)
for i in range(9):
    f = hz("CDEGA"[i % 5], 6 + (i % 2))
    m.place(bell([f], 0.6, 0.25), 0.08 + i * 0.15, 0.07, pan=math.sin(i * 1.7) * 0.7, rev=0.4)
m.place(pop(700), 0.05, 0.2)
m.place(pop(820), 0.21, 0.2)
m.place(riser(0.55), T["hook"] - 0.55, 0.3)
m.place(thud(), T["hook"], 0.5)

# ---------- 질문 ----------
m.place(pluck(hz("E", 4), 0.6), T["hook"], 0.25, rev=0.3)
m.place(pluck(hz("G", 4), 0.6), T["hook"] + 0.22, 0.25, rev=0.3)
m.place(whoosh(0.3, 800, 6000), T["brand"] - 0.28, 0.18, pan=-0.3)

# ---------- 브랜드 ----------
b = T["brand"]
m.place(pop(1150), b, 0.4)
m.place(thud(), b + 0.22, 0.35)
for k, dt in enumerate((0.75, 0.91, 1.1, 1.28)):
    m.place(pop(820 + k * 90), b + dt, 0.18, pan=-0.2 + k * 0.15)
m.place(whoosh(0.4, 1500, 9000), b + 1.6, 0.14, pan=0.3)
m.place(pop(980), b + 2.15, 0.3)

# 본편 비트 1: 브랜드 ~ 방법 장면 끝
m.beat_bed(T["brand"], T["verdict"], bpm=BPM, level=0.8)

# ---------- 고민 3가지 ----------
c = T["check"]
for i in range(3):
    m.place(pop(640 + i * 110), c + 0.65 + i * 0.4, 0.3, pan=-0.3 + i * 0.3)
m.place(whoosh(0.5, 400, 5000), c + 2.0, 0.2)
m.place(thud(), c + 2.3, 0.4)
m.place(pop(1300), c + 2.48, 0.28)
m.place(whoosh(0.45, 6000, 600), c + 3.45, 0.22)
for k, dt in enumerate((3.8, 3.93, 4.06, 4.25, 4.4)):
    m.place(pop(760 + k * 70), c + dt, 0.15)
m.place(whoosh(0.4, 1500, 9000), c + 4.55, 0.14)

# ---------- 방법: 타자 → 단계 → 칸 → 완성 ----------
s = T["method"]
n1, n2, cps = len("누구나 1시간 안에"), len("1시간짜리 영상 완성."), 17
for i in range(n1):
    m.place(click(), s + i / cps, 0.35, pan=0.15)
for i in range(n2):
    m.place(click(), s + n1 / cps + 0.12 + (i + 1) / cps, 0.35, pan=0.15)
m.place(whoosh(0.7, 300, 5000), s + 0.3, 0.25, pan=0.6)
for j in range(4):
    m.place(tick(), s + 1.0 + j * 0.08, 0.2)
step_at = [1.5 + j * 0.62 for j in range(4)]
for j, at in enumerate(step_at):
    m.place(pop(hz("CEGC"[j], 5) if j < 3 else hz("C", 6)), s + at, 0.32, rev=0.2)
    for q in range(3):
        m.place(tick(), s + at + q * 0.15, 0.25, pan=-0.2)
        m.place(tick(), s + at + q * 0.15 + 0.42, 0.18, pan=0.5)
m.place(bell([hz("C", 6), hz("G", 6)], 1.2, 0.5), s + 4.05, 0.25, rev=0.35)

# ---------- 판정: 물결 → 슬롯 → 멈춤 ----------
v = T["verdict"]
m.place(whoosh(0.55, 300, 4000), v - 0.5, 0.35)
m.place(impact(), v, 0.35, rev=0.3)
m.place(pad("Am", 2.6), v, 0.2, rev=0.4)


def reel_pos(lt, n=11, a=0.35, bb=2.1):
    k = min(1.0, max(0.0, (lt - a) / (bb - a)))
    return n * (1 - (1 - k) ** 4)


prev = 0
for f in range(int(3.0 * 1000)):
    lt = f / 1000
    p = math.floor(reel_pos(lt))
    if p != prev:
        m.place(tick(), v + lt, 0.4, pan=0.1)
        prev = p
m.place(pop(1400), v + 2.1, 0.45, rev=0.3)
m.place(bell([hz("E", 5), hz("B", 5)], 1.0, 0.4), v + 2.12, 0.3, rev=0.4)
m.place(whoosh(0.45, 500, 8000), T["result"] - 0.45, 0.3)

# ---------- 결과 ----------
r = T["result"]
m.place(impact(), r, 0.45, rev=0.3)
m.beat_bed(T["result"], T["free"], bpm=BPM, progression=("F", "G", "C", "Am"), level=0.8)
for i in range(20):
    m.place(tick(), r + 1.15 + 1.05 * (1 - (1 - i / 20) ** (1 / 3)), 0.22, pan=-0.4)
m.place(whoosh(0.4, 900, 7000), r + 2.75, 0.18)
for i in range(8):
    m.place(bell([hz("CEGA"[i % 4], 6)], 0.4, 0.2), r + 2.95 + i * 0.09, 0.06, pan=math.sin(i) * 0.6)

# ---------- 가져가실 것 ----------
t = T["take"]
m.place(pop(900), t, 0.2)
m.place(pop(1000), t + 0.2, 0.2)
m.place(pop(1100), t + 0.35, 0.3)
for j in range(4):
    m.place(pop(700 + j * 60), t + 0.85 + j * 0.12, 0.2, pan=0.4)
for j in range(4):
    m.place(pluck(hz("CEGC"[j], 5 if j < 3 else 6), 0.5), t + 1.55 + j * 0.5, 0.3, rev=0.3)
m.place(riser(0.55), T["free"] - 0.55, 0.32)

# ---------- 100% 무료 ----------
f0 = T["free"]
m.place(pad("C", 3.0), f0, 0.2, rev=0.45)
m.place(riser(1.0), f0, 0.25)
m.place(impact(), f0 + 1.0, 0.5, rev=0.35)
m.place(pop(1200), f0 + 1.5, 0.35)
m.place(whoosh(0.35, 6000, 500), T["end"] - 0.35, 0.22)

# ---------- 엔딩 ----------
e = T["end"]
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 3.2, 1.2), e + 0.05, 0.45, rev=0.45)
m.place(pad("C", DUR - e), e, 0.26, rev=0.4)
m.place(thud(), e + 0.75, 0.3)
m.place(pop(1000), e + 1.2, 0.3)
m.place(pop(1150), e + 1.5, 0.2)
for i in range(len("deep-mark-on.kr")):
    m.place(click(), e + 1.8 + i * 0.033, 0.25)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav"), fade_out=1.0))
