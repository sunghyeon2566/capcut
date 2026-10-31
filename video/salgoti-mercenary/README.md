# 살곶이 무료 용병단 — 홍보 모션 영상

- 결과물: `out/salgoti-mercenary.mp4` (1920×1080, 30fps, 27.7초, 소리 포함)
- 내용 출처: 모임 일정 글(제9회 라이브배팅 & 연습경기), 라인업 글의 안내 문구, 썸네일·상품 증정·경기 영상 썸네일 이미지
- 스타일: 레퍼런스(128BPM 모션 쇼릴 — 튀는 공, 키네틱 타입, 도형 변형, 점 매트릭스, 3D 입자, 크림 바탕, 빠른 컷, 로고 엔딩,
  네 귀퉁이 HUD)를 야구 소재로 옮김. 모든 컷은 128BPM 박 위에 있다(한 박 0.469초)

## 구성

| 박 | 시간 | 장 | 화면 |
|---|---|---|---|
| 0 | 0.0초 | 01 PLAY BALL | 야구공이 세 번 튀고 카메라로 날아옴 → '딱!' |
| 5 | 2.3초 | 02 ANYONE OK | 초보도 OK! → 실력자도 OK! → 다 같이 야구하자! |
| 11 | 5.2초 | 03 THE FIELD | 공 → 다이아몬드 → 홈플레이트 변형, 살곶이야구장 · 왕십리 |
| 17 | 8.0초 | 04 SCOREBOARD | LED 전광판: 색 파도 → 무료 → 모집중 |
| 23 | 10.8초 | 05 THE BALL | 점으로 된 3D 야구공(빨간 실밥), 함께하는 야구, 더 즐거운 인생! |
| 27 | 12.7초 | 06 OUR TEAM | 썸네일 → 상품 증정 사진 → 지난 경기 영상 썸네일 |
| 39 | 18.3초 | 07 GAME DAY | 제9회 → 레드(1루) vs 블루(3루) → 라이브배팅 → & → 연습경기 |
| 47 | 22.0초 | 08 FIN | 로고 + 살곶이 무료 용병단. + 일정·장소·문의 |

## 다시 렌더하기

필요: Node 18+, ffmpeg, Python 3 + numpy, Playwright(Chromium)

```bash
cd video/salgoti-mercenary
bash fetch_fonts.sh fonts "Noto Sans KR:500,700,900" "Black Han Sans:400" "Archivo Black:400" "JetBrains Mono:400,700"
curl -sS "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1" | grep -o 'https:[^)]*' | head -1 | xargs curl -sS -o fonts/InstrumentSerif-Italic.ttf
python3 sound.py                                                         # out/sound.wav
node render.mjs . --stills 1,3,4,7,9.4,10.5,12,13.6,15.5,17.3,19,24      # 스틸 확인
node render.mjs . --audio out/sound.wav --out out/salgoti-mercenary.mp4  # 전체 렌더(약 40초)
```

## 고치는 곳 (`index.html` 맨 위)

- `COPY` — 모든 문구. 다음 회차는 `round`(회차), `event`, `when`(날짜·시간)만 바꾸면 된다
- `COPY.team` — 사진 카드 3장(이미지 키, 캡션, 라벨). 이미지는 `assets/` 의 `thumb.png`·`prize.png`·`game.png`
- `CH` — 장 순서와 시작 박, `C` — 색(빨강·파랑·라임·크림·분홍)
- 시각을 바꾸면 `sound.py` 의 `CH` 도 같은 값으로

## 확인할 것

- 사진·로고는 원본이 작아서(가로 약 460px) 2배로 키워 썼습니다. 큰 원본이 있으면 `assets/` 의 파일만 바꾸면 됩니다.
- 상품 받는 장면은 받은 사진 1장으로 만들었습니다. 영상 클립이 있으면 프레임을 뽑아 카드에 넣을 수 있습니다.
- 개인 정보는 저장소에 올리지 않았습니다: 팀원 사진(`assets/thumb.png`·`prize.png`·`game.png`), 결과 영상(`out/*.mp4`),
  엔딩 문의처(`local.js` — `window.LOCAL = { contact: '...' }`). 다시 렌더하려면 이 파일들을 같은 자리에 두세요.
  `local.js` 가 없으면 엔딩 문의처는 기본 문구로 나옵니다.
- 사운드는 합성한 가이드 트랙입니다(레퍼런스와 같은 128BPM).
