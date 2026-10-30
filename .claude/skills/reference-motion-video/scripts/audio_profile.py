"""소리 파일의 흐름을 글로 보여 준다: 0.5초 음량 막대, 추정 템포, 강한 온셋.

    python3 audio_profile.py song.wav      # 16bit PCM wav (ffmpeg -ac 1 -ar 22050 로 만들기)

컷을 박자에 맞추거나, 비트가 들어오는 순간(드롭)을 찾을 때 쓴다.
"""
import sys
import wave

import numpy as np

w = wave.open(sys.argv[1])
sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
if w.getnchannels() > 1:
    x = x.reshape(-1, w.getnchannels()).mean(axis=1)

step = int(sr * 0.5)
print("time   loudness")
for i in range(0, len(x) - step + 1, step):
    rms = np.sqrt(np.mean(x[i:i + step] ** 2)) + 1e-9
    db = 20 * np.log10(rms)
    print(f"{i / sr:5.1f}s {db:6.1f} dB " + "#" * int(max(0, db + 50)))

fr, hp = 1024, 256
frames = (len(x) - fr) // hp
spec = np.abs(np.array([np.fft.rfft(x[i * hp:i * hp + fr] * np.hanning(fr)) for i in range(frames)]))
flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1)
flux = (flux - flux.mean()) / (flux.std() + 1e-9)
fps = sr / hp
ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
best = max(
    ((bpm, sum(np.interp(60 / bpm * fps * k, np.arange(len(ac)), ac) for k in (1, 2, 4))) for bpm in np.arange(60, 181, 0.5)),
    key=lambda p: p[1],
)
print(f"\ntempo ≈ {best[0]:.1f} BPM  (한 박 {60 / best[0]:.3f}s)")

peaks = [i for i in range(1, len(flux) - 1) if flux[i] > 2.5 and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
times = []
for i in peaks:
    t = i / fps
    if not times or t - times[-1] > 0.25:
        times.append(t)
print("strong onsets:", " ".join(f"{t:.2f}" for t in times[:80]))
