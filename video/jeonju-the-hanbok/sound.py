"""가이드 사운드트랙 — 세마치장단 느낌의 장구 + 가야금(카플러스-스트롱 합성) + 효과음.

    python3 sound.py        # out/sound.wav

index.html 의 동작 시각(MV, KEYS, RINGS, BURSTS)과 같은 시각에 소리를 놓는다.
90BPM, 한 동작 = 3박(2초) = 장단 한 마디.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import SR, Mix, band, bell, hz, noise, pad, riser, tt, whoosh  # noqa: E402

DUR = 28.0
BPM = 90
BEAT = 60 / BPM
SUB = BEAT / 3
T_END = 22.0
rng = np.random.default_rng(3)


# ---------- 악기 ----------
def gayageum(f, d=1.8, bright=0.55, decay=0.996):
    """카플러스-스트롱 현 뜯기 — 가야금처럼 둥글고 길게 남는 소리."""
    N = max(2, int(SR / f))
    n = int(d * SR)
    y = np.zeros(n + N + 1)
    exc = rng.uniform(-1, 1, N)
    exc = band(exc, 80, 1200 + 5000 * bright)
    y[1:N + 1] = exc / (np.max(np.abs(exc)) + 1e-9)
    for s in range(N + 1, n + N + 1, N):
        e = min(s + N, n + N + 1)
        y[s:e] = 0.5 * (y[s - N:e - N] + y[s - N - 1:e - N - 1]) * decay
    out = y[1:n + 1]
    env = np.minimum(1, tt(d) / 0.002) * np.minimum(1, (d - tt(d)) / 0.15)
    return out * env


def kung():
    """쿵 — 장구 북편(낮고 둥근 소리)."""
    t = tt(0.6)
    f = 58 + 40 * np.exp(-t / 0.04)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    s += band(noise(0.6), 60, 400) * np.exp(-t / 0.05) * 0.25
    return np.tanh(s * 1.4)


def deok(soft=False):
    """덕 — 장구 채편(마른 나무 소리)."""
    t = tt(0.12)
    s = band(noise(0.12), 1400, 6500) * np.exp(-t / (0.018 if soft else 0.026))
    s += np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.02) * 0.5
    return s * (0.6 if soft else 1.0)


def deong():
    k, d = kung(), deok()
    k[: len(d)] += d * 0.8
    return k


PENTA = [("C", 4), ("D", 4), ("E", 4), ("G", 4), ("A", 4), ("C", 5), ("D", 5), ("E", 5), ("G", 5), ("A", 5), ("C", 6)]


def note(i):
    n, o = PENTA[i % len(PENTA)]
    return hz(n, o)


m = Mix(DUR)

# ---------- 시작: 고요 ----------
m.place(pad("Am", 2.4), 0.0, 0.16, rev=0.5)
for i, idx in enumerate((0, 2, 3, 4, 5, 7)):            # 가야금 훑기(아래→위)
    m.place(gayageum(note(idx), 2.0), 0.25 + i * 0.07, 0.32, pan=-0.4 + i * 0.15, rev=0.35)
m.place(bell([hz("E", 6), hz("A", 6)], 1.6, 0.6), 0.9, 0.08, rev=0.5)

# ---------- 장단: 2초(3박)마다 한 마디 ----------
PHRASES = [(5, 4, 3), (4, 5, 7), (3, 2, 0), (2, 3, 4), (5, 7, 8), (7, 5, 4), (4, 3, 2), (3, 4, 5)]
for bar, start in enumerate(np.arange(2.0, 18.0 - 1e-6, 3 * BEAT)):
    m.place(deong(), start, 0.55)
    m.place(deok(), start + 3 * SUB, 0.45, pan=0.2)
    m.place(deok(soft=True), start + 5 * SUB, 0.35, pan=0.2)
    m.place(kung(), start + 6 * SUB, 0.45)
    m.place(deok(), start + 7 * SUB, 0.4, pan=0.2)
    ph = PHRASES[bar % len(PHRASES)]
    for j, idx in enumerate(ph):
        m.place(gayageum(note(idx), 1.4), start + j * BEAT, 0.26, pan=0.3 * (j - 1), rev=0.3)
    m.place(gayageum(note(ph[0] - 5 if ph[0] >= 5 else ph[0]) / 2, 1.8, bright=0.3), start, 0.22, rev=0.2)
    m.place(pad("Am" if bar % 2 == 0 else "C", 3 * BEAT + 0.2), start, 0.07, rev=0.4)

# ---------- 동작 효과음 ----------
for s in (2.0, 4.0, 8.0, 12.0, 16.0):                   # 동작이 바뀔 때 소매 바람
    m.place(whoosh(0.5, 500, 5000), s + 0.25, 0.16, pan=0.3)
for at in (2.8, 8.85, 16.75):                           # 손끝 불꽃
    m.place(bell([hz("A", 6), hz("E", 7)], 1.0, 0.35), at, 0.16, pan=0.4, rev=0.4)
    m.place(whoosh(0.35, 3000, 9000), at - 0.3, 0.14, pan=0.5)
for at, g in ((5.0, 0.5), (7.5, 0.55), (12.95, 0.5), (21.4, 0.3)):   # 바닥 원
    m.place(kung(), at, g, rev=0.3)
    m.place(bell([hz("C", 6), hz("G", 6)], 1.4, 0.5), at + 0.02, 0.12, rev=0.5)
m.place(whoosh(1.2, 300, 6000), 6.3, 0.3)               # 한 바퀴
for i, at in enumerate((10.22, 10.88, 11.55)):          # 치마 색이 바뀌는 순간
    m.place(gayageum(note(5 + i * 2), 1.0, bright=0.8), at, 0.3, pan=-0.3 + i * 0.3, rev=0.3)
    m.place(whoosh(0.3, 1500, 8000), at - 0.2, 0.1)
m.place(bell([hz("C", 6), hz("E", 6), hz("G", 6)], 1.8, 0.7), 12.95, 0.2, rev=0.5)   # 올인원
for i, idx in enumerate((4, 7)):                        # 양가 코디: 두 음이 함께
    m.place(gayageum(note(idx), 2.0), 14.45 + i * 0.05, 0.3, pan=-0.5 + i, rev=0.4)
m.place(whoosh(0.5, 2000, 9000), 16.6, 0.2, pan=0.6)    # 빛줄기

# ---------- 클라이맥스 ----------
m.place(riser(0.6), 18.5, 0.3)
m.place(deong(), 19.1, 0.9, rev=0.4)
m.place(kung(), 19.35, 0.6, rev=0.4)
m.place(bell([hz("A", 5), hz("C", 6), hz("E", 6), hz("A", 6)], 2.6, 1.1), 19.1, 0.35, rev=0.55)
for i in range(9):
    m.place(gayageum(note(2 + i), 1.6, bright=0.8), 19.15 + i * 0.06, 0.24, pan=-0.6 + i * 0.15, rev=0.4)
m.place(pad("Am", 2.5), 19.1, 0.14, rev=0.5)
for i, at in enumerate(np.arange(19.1, 21.0, BEAT)):
    m.place(kung(), at + BEAT, 0.35)
    m.place(deok(soft=True), at + BEAT + SUB, 0.3)

# ---------- 인사 → 달 속으로 → 엔딩 ----------
m.place(gayageum(note(5), 2.0), 21.4, 0.28, rev=0.4)
m.place(riser(0.8), 21.55, 0.22)
m.place(whoosh(0.8, 300, 7000), 21.6, 0.25)
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 3.5, 1.3), T_END + 0.05, 0.32, rev=0.55)
m.place(pad("C", DUR - T_END), T_END, 0.12, rev=0.5)
for i, idx in enumerate((5, 7, 8, 9, 8, 7, 5, 4, 5, 7, 9, 10)):
    m.place(gayageum(note(idx), 1.6, bright=0.4), T_END + 0.4 + i * BEAT * 0.75, 0.2, pan=0.3 * np.sin(i), rev=0.45)
for at in (T_END + 1.0, T_END + 1.45):                  # 칩·예약 버튼 등장
    m.place(deok(soft=True), at, 0.3)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav"), fade_out=1.5))
