# 살곶이 무료 용병단 v2 — 홍보 모션 영상 (계속 쓰는 버전)

- 결과물: `out/salgoti-mercenary-v2.mp4` (1920×1080, 30fps, 18초, 레퍼런스 음악)
- 날짜·회차 없이 "매주 토요일 저녁 10시"로 만들어 계속 쓸 수 있다
- 스타일: 레퍼런스(터미널 타이핑 → 120BPM 박마다 바뀌는 입자 아이콘 카드 → 소용돌이 → 넓은 크롬 로고 → 한 줄로 꺼짐)
- 음악: 레퍼런스 영상의 음악(10초)을 `music.py` 가 두 마디 반복 구간으로 18초까지 늘린다. 강박이 2·6·10·14초, 큰 박이 14.5초에 온다

## 구성

| 시간 | 음악 | 화면 |
|---|---|---|
| 0–2초 | 인트로 | 터미널: `~/salgoti $ ./play --free --every-saturday`, 로딩 바 → 입자 흐름 |
| 2–6초 | 본편 | 0.5초마다 카드 01–08: 무료 용병단 · 초보도 OK · 실력자도 OK · 라이브배팅 · 연습경기 · 레드 vs 블루 · 배트·헬멧 대여 · 다 같이 야구하자! |
| 6–10초 | 본편 반복 | 카드 09–10: 썸네일 사진, 상품 증정 사진 |
| 10–14초 | 본편 반복 | 1초마다 카드 11–14: 매주 토요일 · 저녁 10시 · 살곶이야구장 · 무료! |
| 14–18초 | 아웃트로 | 소용돌이 → 로고 + 살곶이 무료 용병단 + Together We Play! + 매주 토요일 저녁 10시 · 살곶이야구장 + 문의 → 한 줄로 꺼짐 |

## 다시 렌더하기

```bash
cd video/salgoti-mercenary-v2
python3 music.py                                                            # music/reference-music.wav → out/music.wav
node render.mjs . --stills 1.2,2.3,4.8,7,9,10.6,13.6,15.2,16.8               # 스틸 확인
node render.mjs . --audio out/music.wav --out out/salgoti-mercenary-v2.mp4  # 전체 렌더(약 30초)
```

폰트는 `../salgoti-mercenary/README.md` 의 명령으로 받는다(같은 폰트).

## 고치는 곳 (`index.html` 맨 위)

- `COPY.feats` / `COPY.when` — 카드의 아이콘·제목·설명. 아이콘은 `DRAW` 의 그림(흰 선)을 점으로 바꿔 쓴다
- `COPY.photos` — 사진 카드 2장. 이미지는 `assets/thumb.png`·`prize.png`
- `COPY.info` · `COPY.easy` — 엔딩 정보(요일·시간·장소)
- 장 길이는 음악 반복(4초)에 맞춰져 있다: `T` 와 `music.py` 의 `REPEAT` 를 함께 바꾼다

## 저장소에 올리지 않은 파일

- 팀원 사진 `assets/thumb.png`·`prize.png`, 문의처 `local.js`(`window.LOCAL = { contact: '...' }`)
- 레퍼런스 음악 `music/reference-music.wav` 와 결과 영상 — 음원 저작권이 확인되지 않아 올리지 않는다.
  게시할 때 플랫폼에서 음원 문제로 제한될 수 있다
