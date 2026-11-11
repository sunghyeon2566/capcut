# 삼청동수제비 · 음식점 레퍼런스 9편

사용자가 준 레퍼런스 영상 9개(모두 음식점용)의 문법을 따라, 삼청동수제비 자료(사진 · 리뷰 · 가게 소개 · 지도 · 주소 · 전화번호)로 다시 만든 영상입니다.
화면 글자는 받은 자료에 있는 내용만 씁니다(리뷰는 원문 그대로, 길면 말줄임).

| 폴더 | 스타일 | 규격 | 결과 |
|---|---|---|---|
| ref01-neon | 검은 바탕 · 네온 연두 | 16:9 · 15초 | out/삼청동수제비_레퍼런스01_네온_16x9.mp4 |
| ref02-type | 화면 가득 큰 글자 | 16:9 · 12초 | out/삼청동수제비_레퍼런스02_큰글자_16x9.mp4 |
| ref03-glass | 유리 카드 | 9:16 · 30초 | out/삼청동수제비_레퍼런스03_유리_9x16.mp4 |
| ref04-green | 짙은 초록 앱 소개 (광고영상제작기 엔진) | 16:9 · 55초 | out/삼청동수제비_레퍼런스04_초록앱_16x9.mp4 |
| ref05-red | 어두운 바탕 · 빨간 강조 | 16:9 · 30초 | out/삼청동수제비_레퍼런스05_숯빨강_16x9.mp4 |
| ref06-kinetic | 알록달록 색 블록 | 16:9 · 15초 | out/삼청동수제비_레퍼런스06_색블록_16x9.mp4 |
| ref07-steps | 흰 바탕 · 단계별 소개 | 16:9 · 15초 | out/삼청동수제비_레퍼런스07_흰단계_16x9.mp4 |
| ref08-phone | 휴대폰 한 대 | 3:2 · 17초 | out/삼청동수제비_레퍼런스08_휴대폰_3x2.mp4 |
| ref09-quiz | 퀴즈 앱 · 자줏빛 | 9:16 · 15초 | out/삼청동수제비_레퍼런스09_퀴즈_9x16.mp4 |

## 다시 만들기

공용 도구는 `_lib/` 에 있습니다(lib.js: 그리기 도우미 · 가게 자료 `SJ`, sound.py: cues.json → 소리, render.mjs: 프레임 렌더).

```bash
cd motion/samcheong-refs
python3 _lib/sound.py ref09-quiz
node _lib/render.mjs ref09-quiz --root . --audio out/sound.wav --out ref09-quiz/out/삼청동수제비_레퍼런스09_퀴즈_9x16.mp4
```

- 스틸 확인: `node _lib/render.mjs ref09-quiz --root . --stills 1.2,3.6,6.0`
- ref04-green 은 광고영상제작기(motion-video-maker) 엔진을 씁니다: `python3 ref04-green/make.py`

## 고치는 곳

- 가게 정보 · 리뷰 문장: `_lib/lib.js` 의 `SJ`
- 장면 시각: 각 `index.html` 의 `T`, 소리 시각: 각 `cues.json`
- 영상 길이 · 크기: 각 `index.html` 의 `window.CONF`

광고영상제작기에는 긴 변 1280px로 줄여 `references/sj-ref01~09` 로 넣었습니다(업종: 음식점).
