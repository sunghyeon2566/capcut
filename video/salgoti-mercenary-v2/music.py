"""레퍼런스 음악(10초)을 영상 길이(18초)로 늘린다 — 두 마디 반복 구간을 박에 맞춰 이어 붙인다.

    python3 music.py        # music/reference-music.wav → out/music.wav

구성: 인트로 [0, 2) + 본편 [2, 6) × 3 + 아웃트로 [6, 끝]
원곡의 강박은 영상 시간보다 약 0.0425초 늦게 들어오므로 앞을 그만큼 잘라
강박이 2·6·10·14초(그리고 아웃트로 큰 박 14.5초)에 정확히 오게 한다.
이음새는 강박 10ms 앞에서 자르고 12ms 크로스페이드로 잇는다.
"""
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "music", "reference-music.wav")
OUT = os.path.join(HERE, "out", "music.wav")
OFFSET = 0.0425          # 원곡 강박 지연
LOOP_A, LOOP_B = 1.99, 5.99
REPEAT = 3
XF = 0.012

with wave.open(SRC) as w:
    sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), "<i2").reshape(-1, 2).astype(np.float64) / 32768
a = a[int(OFFSET * sr):]
s = lambda x: int(round(x * sr))  # noqa: E731

segs = [(0, LOOP_A)] + [(LOOP_A, LOOP_B)] * REPEAT + [(LOOP_B, len(a) / sr)]
xf = s(XF)
chunks = []
for i, (x0, x1) in enumerate(segs):
    c = a[s(x0): s(x1)].copy()
    if i > 0:
        # 이음새: 앞 조각이 원곡에서 이어지던 소리(a[prev_end:])를 xf 동안 겹쳐 사라지게 한다 — 길이는 그대로
        pe = s(segs[i - 1][1])
        cont = a[pe: pe + xf]
        ramp = np.linspace(0, 1, len(cont))[:, None]
        c[: len(cont)] = c[: len(cont)] * ramp + cont * (1 - ramp)
    chunks.append(c)
out = np.concatenate(chunks)
out = np.concatenate([out, np.zeros((s(0.3), 2))])      # 끝에 0.3초 여유
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype("<i2").tobytes())
print(OUT, f"{len(out) / sr:.3f}s")
