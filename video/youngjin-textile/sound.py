"""가이드 사운드트랙 — 느린 시네마틱(80BPM): 낮은 드론 + 심장 같은 펄스 + 장 전환의 휙·쿵 + 숫자 틱 + 종.

    python3 sound.py        # out/sound.wav

시각은 index.html 의 T 와 같은 값.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, band, bell, hz, impact, noise, pad, pluck, riser, thud, tick, tt, whoosh  # noqa: E402

BPM = 80
B = 60 / BPM
T = {
    "intro": 0, "title": 3, "warp": 7.5, "people": 8.25, "factory": 14.25, "products": 20.25,
    "clients": 27.75, "flash": 33.75, "moq": 34, "lines": 40, "burst": 43.5, "end": 44.25,
}
DUR = 50.0


def drone(chord, d, gain=1.0):
    return pad(chord, d) * gain


def pulse():
    """심장 같은 낮은 박동 두 번(쿵-쿵)."""
    s = np.zeros(int(0.6 * 48000))
    for off, g in ((0.0, 1.0), (0.18, 0.6)):
        th = thud()
        i = int(off * 48000)
        s[i:i + len(th)] += th * g
    return s


def needle():
    """바늘이 찌르는 짧은 소리."""
    t = tt(0.08)
    return band(noise(0.08), 2500, 9000) * np.exp(-t / 0.008) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.02) * 0.4


m = Mix(DUR)

# 인트로: 아주 낮은 드론 + 째깍
m.place(drone("Am", 7.6), 0.0, 0.16, rev=0.5)
for i in range(6):
    m.place(tick(), 0.5 + i * 0.4, 0.12, pan=0.2)
m.place(riser(1.2), T["title"] - 1.2, 0.25)
# 제목: 입자가 모이며 큰 울림
m.place(impact(), T["title"] + 1.3, 0.45, rev=0.5)
m.place(bell([hz("A", 4), hz("E", 5), hz("A", 5)], 3.5, 1.4), T["title"] + 1.35, 0.25, rev=0.6)
# 하얀 화면 → 워프
m.place(riser(1.0), T["warp"] - 1.0, 0.3)
m.place(whoosh(0.8, 200, 9000), T["warp"], 0.4)
m.place(impact(), T["people"], 0.4, rev=0.4)

# 본편 드론 + 박동(장마다 화음)
chords = [("people", "F"), ("factory", "C"), ("products", "G"), ("clients", "Am")]
for k, ch in chords:
    a = T[k]
    b = {"people": T["factory"], "factory": T["products"], "products": T["clients"], "clients": T["flash"]}[k]
    m.place(drone(ch, b - a + 0.5), a, 0.2, rev=0.5)
    for bt in np.arange(a, b - 0.2, B * 2):
        m.place(pulse(), bt, 0.35)
    m.place(whoosh(0.5, 300, 5000), a - 0.4, 0.15)

# 01 인력: 숫자 틱(0 → 20)
for i in range(20):
    m.place(tick(), T["people"] + 0.3 + 2.9 * (1 - (1 - i / 20) ** (1 / 3)), 0.18, pan=-0.3)
# 03 품목: 박마다 종
for i in range(4):
    m.place(bell([hz("CEGA"[i], 6)], 1.4, 0.6), T["products"] + 0.4 + i * 0.9, 0.18, pan=-0.4 + i * 0.25, rev=0.5)
m.place(whoosh(0.4, 600, 6000), T["products"] + 4.0, 0.12)
# 04 납품: 이름마다 낮은 울림
for i in range(4):
    m.place(pluck(hz("A", 3) * (1.0, 1.122, 1.335, 1.498)[i], 0.9), T["clients"] + 0.5 + i * 0.85, 0.3, rev=0.5)
m.place(bell([hz("A", 5), hz("C", 6), hz("E", 6)], 2.0, 0.8), T["clients"] + 0.5 + 4 * 0.85, 0.2, rev=0.5)

# 하얀 섬광
m.place(impact(), T["flash"], 0.5, rev=0.5)
# 05 주문: 박음질(바늘) + 점이 하나씩
m.place(drone("Am", T["lines"] - T["moq"] + 0.5), T["moq"], 0.14, rev=0.5)
for x in range(380, 1920, 620):
    m.place(needle(), T["moq"] + 0.1 + 2.3 * ((x / 1920) ** (1 / 1.0)) * 0.9, 0.5)
for i in range(4):
    m.place(bell([hz("E", 6)], 0.8, 0.4), T["moq"] + 2.9 + i * 0.35, 0.14, pan=-0.4 + i * 0.27, rev=0.4)
# 짧은 문장: 아주 조용히
m.place(pluck(hz("E", 5), 1.2), T["lines"] + 0.2, 0.2, rev=0.6)
m.place(pluck(hz("A", 5), 1.2), T["lines"] + 1.95, 0.2, rev=0.6)
m.place(riser(1.2), T["burst"] - 1.2, 0.3)
# 폭발 → 엔딩
m.place(impact(), T["burst"], 0.6, rev=0.5)
m.place(whoosh(0.7, 9000, 300), T["burst"], 0.25)
m.place(bell([hz("A", 4), hz("C", 5), hz("E", 5), hz("B", 5)], 4.0, 1.6), T["end"] + 1.0, 0.3, rev=0.6)
m.place(drone("F", DUR - T["end"]), T["end"], 0.18, rev=0.5)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav"), fade_out=1.5))
