"""영상마다 cues.json 을 읽어 배경음을 합성한다.   python3 ../_lib/sound.py <영상 폴더>   → <폴더>/out/sound.wav

cues.json
  {"dur": 15, "bpm": 120,
   "beds": [{"a": 0.3, "z": 13, "prog": ["Am","F","C","G"], "level": 0.7}],
   "pads": [{"a": 13, "z": 15, "chord": "C", "g": 0.2}],
   "hits": [[시각, "whoosh"|"impact"|"thud"|"pop"|"riser"|"tick"|"click"|"bell"|"shimmer"|"glitch"|"swell", 크기, (값)]],
   "types": [[시작, 끝, 1초에 몇 번]]}
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound_kit import Mix, band, bell, click, glitch, hz, impact, noise, pad, pop, riser, thud, tick, tt, whoosh  # noqa: E402


def shimmer(d=0.8):
    t = tt(d)
    return band(noise(d), 4000, 12000) * np.sin(np.pi * t / d) ** 2 * 0.6


def swell(d=1.2):   # 반대로 감는 소리 (끝에 '훅')
    t = tt(d)
    return band(noise(d), 300, 5000) * (t / d) ** 2.5 * 0.8


def main(folder):
    c = json.load(open(os.path.join(folder, "cues.json"), encoding="utf-8"))
    dur, bpm = float(c["dur"]), float(c.get("bpm", 120))
    m = Mix(dur)
    for b in c.get("beds", []):
        m.beat_bed(float(b["a"]), min(dur, float(b["z"])), bpm=bpm, progression=tuple(b.get("prog", ("C", "G", "Am", "F"))), level=float(b.get("level", 0.7)))
    for p in c.get("pads", []):
        m.place(pad(p.get("chord", "C"), max(0.5, float(p["z"]) - float(p["a"]))), float(p["a"]), float(p.get("g", 0.2)), rev=0.35)
    rng = np.random.default_rng(5)
    for i, h in enumerate(c.get("hits", [])):
        t, kind, g = float(h[0]), h[1], float(h[2]) if len(h) > 2 else 0.3
        v = h[3] if len(h) > 3 else None
        pan = 0.3 * np.sin(i * 1.7)
        if t >= dur - 0.05:
            continue
        sig = {"whoosh": lambda: whoosh(float(v or 0.5), 400, 6000), "impact": impact, "thud": thud, "pop": lambda: pop(float(v or 900)),
               "riser": lambda: riser(float(v or 0.6)), "tick": tick, "click": click, "glitch": glitch, "shimmer": lambda: shimmer(float(v or 0.8)),
               "swell": lambda: swell(float(v or 1.0)),
               "bell": lambda: bell([hz(n[0], int(n[1])) for n in (v or ["C5", "E5", "G5", "C6"])], d=3.0, decay=1.3)}[kind]()
        if kind == "whoosh":
            t = max(0.0, t - float(v or 0.5) * 0.6)   # 휙은 그 시각에 '닿도록' 조금 일찍
        if kind == "riser":
            t = max(0.0, t - float(v or 0.6))
        m.place(sig, t, g, pan=pan, rev=0.3 if kind in ("bell", "impact", "shimmer", "pop") else 0.15)
    for a, z, rate in c.get("types", []):
        n = int((z - a) * rate)
        for k in range(n):
            m.place(click(), a + k / rate + rng.uniform(-0.01, 0.01), 0.16, pan=rng.uniform(-0.3, 0.3))
    os.makedirs(os.path.join(folder, "out"), exist_ok=True)
    m.write(os.path.join(folder, "out", "sound.wav"), peak=0.85, fade_out=float(c.get("fade", 1.2)))
    print("sound →", os.path.join(folder, "out", "sound.wav"))


if __name__ == "__main__":
    main(sys.argv[1])
