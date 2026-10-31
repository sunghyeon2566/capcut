"""가이드 사운드트랙 — 128BPM, index.html 의 장(박 단위) 시각에 맞춘다.

    python3 sound.py        # out/sound.wav
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, band, bell, click, glitch, hz, impact, noise, pad, pop, riser, thud, tick, tt, whoosh  # noqa: E402

BPM = 128
B = 60 / BPM
at = lambda n: n * B  # noqa: E731  n박째 시각
CH = {"ball": 0, "type": 5, "field": 11, "led": 17, "orb": 23, "team": 27, "game": 39, "fin": 47}
END_B = 59
DUR = at(END_B)


def crack():
    """'딱!' — 배트에 공이 맞는 소리."""
    t = tt(0.3)
    s = band(noise(0.3), 1500, 7000) * np.exp(-t / 0.012) * 1.3
    s += np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.035) * 0.5
    s += np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.05) * 0.35
    s += np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.06) * 0.7
    return np.tanh(s * 1.5)


def shutter():
    """카메라 셔터."""
    s = np.zeros(int(0.2 * 48000))
    for off, g in ((0.0, 1.0), (0.07, 0.7)):
        c = click() * g
        i = int(off * 48000)
        s[i:i + len(c)] += c
    n = band(noise(0.2), 2000, 8000) * np.exp(-tt(0.2) / 0.03) * 0.3
    return s + n


def cheer(d=1.8):
    """멀리서 들리는 함성(가볍게)."""
    t = tt(d)
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.3) / 0.7)
    mod = 1 + 0.3 * np.sin(2 * np.pi * 7 * t) * np.sin(2 * np.pi * 1.3 * t)
    return band(noise(d), 300, 3200) * env * mod * 0.6


m = Mix(DUR)

# 01 PLAY BALL: 튀는 공 → 카메라로 날아와 '딱!'
m.place(pad("Am", at(5)), 0.0, 0.12, rev=0.4)
for i, g in enumerate((0.7, 0.55, 0.45)):
    m.place(thud(), at(1 + i), g)
    m.place(pop(500 + i * 120, 0.08), at(1 + i), 0.15)
m.place(riser(at(1)), at(4), 0.3)
m.place(whoosh(at(1), 400, 9000), at(4), 0.3)
m.place(crack(), at(5), 0.9, rev=0.2)
m.place(impact(), at(5), 0.4, rev=0.3)

# 본편 비트
m.beat_bed(at(5), at(55), bpm=BPM, progression=("Am", "F", "C", "G"), level=0.9)

# 02 키네틱 타입: 단어마다 쾅
for n in (7, 9):
    m.place(impact(), at(n), 0.3, rev=0.25)
    m.place(whoosh(0.25, 3000, 9000), at(n) - 0.22, 0.12)

# 03 도형 변형
for n in (13, 15):
    m.place(whoosh(0.32, 800, 7000), at(n) - 0.32, 0.18)
    m.place(pop(1200), at(n), 0.15)

# 04 전광판: 파도 → 글자가 켜지는 소리
m.place(whoosh(at(2), 300, 6000), at(17), 0.22)
for n in (19, 21):
    for k in range(10):
        m.place(tick(), at(n) + k * 0.035, 0.18, pan=-0.6 + k * 0.12)
    m.place(bell([hz("A", 6)], 0.6, 0.25), at(n) + 0.35, 0.12, rev=0.3)

# 05 입자 공
m.place(bell([hz("E", 6), hz("B", 6)], 1.6, 0.6), at(23), 0.14, rev=0.5)
m.place(riser(0.4), at(27) - 0.4, 0.25)

# 06 사진 카드: 셔터
for n in (27, 31, 35):
    m.place(shutter(), at(n), 0.5, pan=0.2)
    m.place(pop(900), at(n) + 0.05, 0.12)

# 07 GAME DAY
m.place(impact(), at(39), 0.35, rev=0.3)
for k in range(9):
    m.place(tick(), at(39) + k * (1.4 * B / 9), 0.3)
m.place(whoosh(0.3, 1000, 8000), at(41) - 0.25, 0.15)
m.place(pop(700), at(41), 0.25)
m.place(glitch(), at(43), 0.9)
m.place(glitch(), at(43) + 0.09, 0.6)
m.place(whoosh(0.45, 200, 4000), at(44), 0.22)
m.place(impact(), at(45), 0.35, rev=0.3)

# 08 FIN: '딱!' + 함성 + 종
m.place(crack(), at(47), 0.8, rev=0.25)
m.place(cheer(), at(47) + 0.05, 0.3, rev=0.4)
m.place(bell([hz("A", 4), hz("C", 5), hz("E", 5), hz("A", 5)], 3.0, 1.2), at(47) + 0.05, 0.3, rev=0.5)
m.place(pop(1000), at(47) + 1.4, 0.2)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav"), fade_out=1.2))
