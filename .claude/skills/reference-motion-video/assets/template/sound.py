"""가이드 사운드트랙 — index.html의 T와 같은 시각에 비트·전환음·효과음을 놓는다.

    python3 sound.py        # out/sound.wav
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, bell, hz, impact, pad, pop, riser, thud, whoosh  # noqa: E402

DUR = 12.0
BPM = 120
T = {"title": 0.0, "list": 4.0, "end": 8.0}  # index.html의 T 시작값과 같게

m = Mix(DUR)

# 인트로: 패드 + 차임
m.place(pad("C", T["list"] + 0.2), 0.0, 0.25, rev=0.3)
m.place(bell([hz("C", 5), hz("G", 5)], 2.0, 0.8), 0.2, 0.3, rev=0.4)

# 본편 비트(두 번째 장면부터 마지막 장면 직전까지)
m.beat_bed(T["list"], T["end"], bpm=BPM)

# 전환음: 사선 띠(휙+임팩트), 계단(쿵 여섯 번)
m.place(whoosh(0.8, 300, 9000), T["list"] - 0.45, 0.45, pan=0.4)
m.place(impact(), T["list"], 0.35, rev=0.3)
for i in range(6):
    m.place(thud(), T["end"] - 0.45 + i * 0.07, 0.35)

# 장면 안 효과음: 항목이 뜰 때마다 팝(index.html의 등장 시각과 같게)
for i in range(3):
    m.place(pop(700 + i * 120), T["list"] + 0.4 + i * 0.35, 0.3, pan=-0.3 + i * 0.3)

# 엔딩: 라이저 → 해결 화음
m.place(riser(0.5), T["end"] - 0.5, 0.25)
m.place(bell([hz("C", 5), hz("E", 5), hz("G", 5), hz("D", 6)], 2.6, 1.1), T["end"] + 0.1, 0.45, rev=0.45)
m.place(pad("C", DUR - T["end"]), T["end"], 0.28, rev=0.35)

print(m.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "sound.wav")))
