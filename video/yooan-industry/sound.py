"""가이드 사운드트랙 — index.html 의 장 시각(CH=2.2초=4박)에 비트·전환음·효과음을 놓는다.

    python3 sound.py        # out/sound.wav
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, bell, click, hz, impact, pad, pluck, pop, riser, thud, tick, whoosh  # noqa: E402

CH = 2.2
BPM = 240 / CH            # 약 109BPM — 한 장이 한 마디
N = 8                     # 장 수(연혁 5 + 제품 장점 3)
T0 = CH
T_OUT = T0 + N * CH
T_END = T_OUT + CH
DUR = T_END + 1.5 * CH
CHORDS = ("C", "G", "Am", "Em", "F", "C", "Dm", "G")
CHIME = [("C", 6), ("D", 6), ("E", 6), ("G", 6), ("A", 6), ("C", 7), ("D", 7), ("E", 7)]

m = Mix(DUR)
at = lambda i, lt: T0 + i * CH + lt  # noqa: E731  (i번째 장 안의 시각)

# ---------- 인트로 ----------
m.place(pad("C", T0 + 0.3), 0.0, 0.2, rev=0.45)
m.place(bell([hz("C", 5), hz("G", 5)], 2.0, 0.8), 0.3, 0.22, rev=0.45)
m.place(pop(900), 0.45, 0.18)
m.place(pluck(hz("E", 5), 0.5), 0.6, 0.2, rev=0.3)
m.place(riser(0.9), T0 - 0.9, 0.22)

# ---------- 본편 비트(장마다 화음이 바뀐다) ----------
m.beat_bed(T0, T_OUT, bpm=BPM, progression=CHORDS, level=0.75)

# ---------- 장이 바뀔 때: 섬광 = 휙 + 종 ----------
for i in range(N):
    b = T0 + i * CH
    m.place(whoosh(0.35, 1200, 9000), b - 0.3, 0.16, pan=0.3)
    n, o = CHIME[i]
    m.place(bell([hz(n, o)], 1.2, 0.45), b + 0.02, 0.2, pan=-0.2 + i * 0.06, rev=0.45)
    m.place(tick(), b + 0.05, 0.25)                       # 진행 점이 켜짐

# ---------- 아이콘 효과음(index.html 의 ICONS 시각과 같게) ----------
for k in range(4):                                        # 1984 공장: 창문 불
    m.place(pop(700 + k * 120), at(0, 0.9 + k * 0.12), 0.22, pan=-0.3 + k * 0.2)
m.place(whoosh(0.4, 300, 3000), at(1, 0.6), 0.18)         # 1995 Holder: 제품이 내려앉고
m.place(thud(), at(1, 1.0), 0.45)
m.place(thud(), at(1, 1.05), 0.35)                        # 양쪽 홀더가 잡는다
m.place(whoosh(0.6, 400, 6000), at(2, 0.2), 0.2)          # 1997 Cell: 펼침
for k in range(0, 15, 2):
    m.place(pop(900 + k * 30), at(2, 0.85 + k * 0.03), 0.12)
for k in range(3):                                        # 2000 Pallet: 블록 + 위판
    m.place(thud(), at(3, 0.3 + k * 0.12), 0.25)
m.place(impact(), at(3, 0.95), 0.3, rev=0.25)
m.place(pop(1100), at(4, 0.95), 0.3)                      # 2002 체크
m.place(bell([hz("E", 6), hz("B", 6)], 0.8, 0.3), at(4, 1.2), 0.15, rev=0.4)   # 벤처 별
for k in range(4):                                        # COST: Flexo 4단계는 빠르게
    m.place(tick(), at(5, 0.2 + (k + 0.6) * 0.55 / 4), 0.3, pan=0.3)
for k in range(7):                                        # Offset 7단계는 느리게
    m.place(tick(), at(5, 0.2 + (k + 0.6) * 1.2 / 7), 0.15, pan=-0.3)
m.place(pop(1300), at(5, 0.8), 0.25)
for k in range(7):                                        # SIZE: 상자가 쌓인다
    m.place(thud(), at(6, 0.45 + k * 0.13), 0.22)
    m.place(pop(600 + k * 70), at(6, 0.45 + k * 0.13), 0.1)
m.place(whoosh(0.9, 300, 5000), at(7, 0.3), 0.2)          # ECO: 화살표가 돈다
m.place(bell([hz("G", 5), hz("D", 6)], 1.2, 0.5), at(7, 1.1), 0.16, rev=0.4)

# ---------- 점선 원 문구 ----------
m.place(impact(), T_OUT, 0.3, rev=0.35)
m.place(pad("F", CH + 0.3), T_OUT, 0.22, rev=0.45)
m.place(bell([hz("F", 5), hz("A", 5), hz("C", 6)], 2.2, 0.9), T_OUT + 0.3, 0.25, rev=0.5)
m.place(pluck(hz("A", 5), 0.5), T_OUT + 0.55, 0.2, rev=0.3)
m.place(riser(0.6), T_END - 0.6, 0.2)

# ---------- 엔딩 ----------
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 3.2, 1.2), T_END + 0.1, 0.4, rev=0.5)
m.place(pad("C", DUR - T_END), T_END, 0.22, rev=0.45)
m.place(pop(1000), T_END + 0.35, 0.25)
m.place(pop(1200), T_END + 0.8, 0.2)
for k in range(len("www.yooan.co.kr")):
    m.place(click(), T_END + 1.2 + k * 0.04, 0.3)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav"), fade_out=1.2))
