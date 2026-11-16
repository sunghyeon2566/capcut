"""숲속우산 참송이버섯 상품 소개 모션 사운드 — 120BPM 가볍고 밝은 어쿠스틱 느낌 (레퍼런스처럼)
종이 찢는 소리 · 종이가 미끄러지는 소리 · 톡톡 튀어나오는 소리 · 종소리.
나레이션을 얹을 수 있게 음악은 낮게 깐다.

    python3 sound.py      # out/sound.wav

시각은 film.js 의 T 와 같다.
"""
import numpy as np

from sound_kit import SR, Mix, band, bell, hat, hz, kick, noise, pad, pluck, pop, tick, tt, whoosh, thud, ARP, ROOT

DUR = 52.0
T = {"hook": 0.0, "land": 4.0, "c1": 10.0, "c2": 14.0, "c3": 18.0, "c4": 22.0, "circle": 26.0,
     "couple": 32.0, "review": 37.5, "map": 41.5, "end": 46.5}
BEAT = 0.5
rng = np.random.default_rng(5)


def paper_tear(d=0.65):
    """종이 찢는 소리: 바삭바삭 끊기는 잡음"""
    n = int(d * SR)
    s = np.zeros(n)
    for _ in range(int(d * 260)):
        i = int(rng.uniform(0, n - 600))
        L = int(rng.uniform(60, 420))
        s[i:i + L] += band(rng.standard_normal(L), 1200, 9000) * np.exp(-np.arange(L) / (L * 0.3)) * rng.uniform(0.2, 1.0)
    env = np.minimum(1, np.arange(n) / (0.04 * SR)) * np.exp(-np.arange(n) / (0.5 * SR))
    return s * env * 0.6


def paper_slide(d=0.5):
    """종이 한 장이 미끄러지는 소리"""
    t = tt(d)
    return band(noise(d), 300, 3500) * np.sin(np.pi * t / d) ** 1.5 * 0.5


def soft_bed(m, a, b, prog, level=1.0, drums=True):
    """부드러운 킥 · 셰이커 · 우쿨렐레 느낌 뜯는 소리 · 패드"""
    bar = BEAT * 4
    for j, x in enumerate(np.arange(a, b - 1e-6, BEAT)):
        ch = prog[int((x - a) // bar) % len(prog)]
        if drums:
            if j % 2 == 0:
                m.place(kick(), x, 0.42 * level)
            m.place(hat(open_=False), x + BEAT / 2, 0.10 * level, pan=0.3)
            m.place(hat(open_=False), x + BEAT * 0.75, 0.05 * level, pan=-0.3)
        notes = ARP[ch].split()
        for k in range(2):   # 8분음표로 화음을 뜯는다
            m.place(pluck(hz(notes[(j * 2 + k) % 4], 4), 0.35), x + k * BEAT / 2, 0.13 * level, pan=0.35 * (1 if k else -1), rev=0.15)
        if j % 4 == 0:
            m.place(pluck(ROOT[ch] * 2, 0.6), x, 0.25 * level)
    for x in np.arange(a, b - 1e-6, bar):
        ch = prog[int((x - a) // bar) % len(prog)]
        m.place(pad(ch, min(bar, b - x) + 0.25), x, 0.13 * level, rev=0.3)


def melody(m, a, notes, level=1.0):
    """글로켄슈필 같은 짧은 선율 (음, 박)"""
    x = a
    for nt, beats in notes:
        if nt:
            name, octv = nt[:-1], int(nt[-1])
            m.place(bell([hz(name, octv), hz(name, octv) * 2.01], d=0.9, decay=0.35), x, 0.07 * level, pan=0.15, rev=0.3)
        x += beats * BEAT


m = Mix(DUR)
LV = 0.75
P1, P2 = ("F", "C", "Dm", "C"), ("F", "G", "C", "Am")
soft_bed(m, 0.0, T["land"], P1, LV * 0.6, drums=False)
soft_bed(m, T["land"], T["circle"], P1, LV)
soft_bed(m, T["circle"], T["review"], P2, LV)
soft_bed(m, T["review"], T["map"], P1, LV * 0.7, drums=False)
soft_bed(m, T["map"], 51.5, P2, LV * 0.85)
melody(m, T["land"] + 2.0, [("A5", 1), ("C6", 1), ("F5", 2), ("G5", 1), ("A5", 1), ("C6", 2)], 1.0)
melody(m, T["circle"] + 0.0, [("C6", 1), ("A5", 1), ("G5", 1), ("F5", 1), ("G5", 2), ("C6", 2)], 1.0)
melody(m, T["end"] + 0.5, [("F5", 1), ("A5", 1), ("C6", 1), ("F6", 3)], 1.2)

def popn(at, f, g=0.2, pan=0.0):
    m.place(pop(f), at, g, pan=pan, rev=0.2)

# 시작: 버섯 소품 · 색종이 · 글자
popn(0.1, 700, 0.24, -0.3); popn(0.42, 900, 0.24, 0.3)
for i, at in enumerate((0.3, 0.5, 0.7, 0.9, 1.1, 1.3)):
    popn(at, 1200 + i * 80, 0.08, (-1) ** i * 0.5)
for k in range(24):   # 톡톡 박히는 글자
    m.place(tick(), 0.62 + k * 0.065, 0.035, pan=0.1 * np.sin(k))
m.place(paper_tear(0.7), T["land"] - 0.55, 0.5, pan=0.1)
# 언덕: 흙 · 버섯이 쏙쏙
popn(T["land"] + 0.4, 500, 0.22)
for i, at in enumerate((0.85, 1.15, 1.45)):
    popn(T["land"] + at, 800 + i * 160, 0.24, -0.3 + i * 0.3)
m.place(bell([hz("C", 6), hz("E", 6), hz("G", 6)], d=1.4, decay=0.6), T["land"] + 2.1, 0.12, rev=0.4)
m.place(whoosh(0.35, 800, 6000), T["land"] + 2.3, 0.12)   # 형광펜
m.place(paper_slide(0.4), T["land"] + 5.55, 0.25)
# 번호 카드 넷
for key in ("c1", "c2", "c3", "c4"):
    a = T[key]
    m.place(paper_slide(0.35), a + 0.1, 0.3, pan=-0.3)
    popn(a + 0.32, 950, 0.22, -0.4)
    for k in range(6):
        m.place(tick(), a + 0.72 + k * 0.065, 0.04, pan=-0.2)
    popn(a + 0.5, 780, 0.22, 0.4); popn(a + 0.78, 1050, 0.2, 0.4)
    if key != "c4":
        m.place(paper_slide(0.4), a + 3.55, 0.22, pan=0.2)
m.place(thud(), T["c3"] + 0.55, 0.3)   # 무농약 배지
m.place(bell([hz("E", 6), hz("B", 6)], d=1.2, decay=0.5), T["c3"] + 1.25, 0.1, rev=0.4)
m.place(paper_slide(0.5), T["circle"] - 0.45, 0.45, pan=0.4)
# 동그라미 셋
for i in range(3):
    popn(T["circle"] + 0.28 + i * 0.8, 700 + i * 180, 0.28, -0.4 + i * 0.4)
    m.place(bell([hz(("F", "A", "C")[i], 5 + (i == 2))], d=1.0, decay=0.4), T["circle"] + 0.3 + i * 0.8, 0.09, rev=0.3)
m.place(paper_slide(0.5), T["couple"] - 0.45, 0.45)
# 노부부
popn(T["couple"] + 0.25, 600, 0.2, 0.4); popn(T["couple"] + 0.42, 850, 0.22, -0.2)
popn(T["couple"] + 0.55, 900, 0.22, 0.3); popn(T["couple"] + 0.75, 1000, 0.22, 0.4)
for i in range(5):
    m.place(bell([hz("A", 6)], d=0.8, decay=0.3), T["couple"] + 1.25 + i * 0.55, 0.05, pan=0.4, rev=0.4)
m.place(paper_slide(0.5), T["review"] - 0.45, 0.45, pan=-0.4)
# 고객 후기
popn(T["review"] + 0.2, 700, 0.22, -0.3); popn(T["review"] + 0.45, 900, 0.22, 0.3); popn(T["review"] + 0.75, 1100, 0.2, 0.3)
m.place(paper_slide(0.5), T["map"] - 0.45, 0.45, pan=0.4)
# 약도
popn(T["map"] + 0.15, 600, 0.2)
popn(T["map"] + 0.5, 1200, 0.26); m.place(thud(), T["map"] + 0.62, 0.28)   # 핀이 콕
for i in range(3):
    popn(T["map"] + 1.0 + i * 0.55, 900 + i * 120, 0.2, 0.4)
m.place(paper_slide(0.5), T["end"] - 0.45, 0.45)
# 마무리
popn(T["end"] + 0.2, 650, 0.3)
m.place(bell([hz("F", 5), hz("A", 5), hz("C", 6)], d=2.6, decay=1.0), T["end"] + 0.25, 0.16, rev=0.45)
popn(T["end"] + 2.15, 1000, 0.24)
m.place(bell([hz("F", 5), hz("C", 6), hz("F", 6)], d=3.0, decay=1.2), DUR - 3.2, 0.14, rev=0.5)
m.write("out/sound.wav")
print("out/sound.wav")
