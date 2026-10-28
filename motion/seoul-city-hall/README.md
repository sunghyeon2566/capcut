# 서울시청 컨셉 필름 (모션그래픽)

검은 화면, 네온 그린 하프톤 도트, HUD 프레임, 타자 효과, 굵은 키네틱 타이포로 만든 26초 홍보 영상입니다.
레퍼런스 런칭 필름의 연출 문법을 서울시청 이야기로 옮겼습니다.

- 결과물: `out/seoul-city-hall.mp4` (1920×1080, 30fps, 26초, 사운드 포함)
- 소스: `index.html` 한 파일. 모든 장면은 시간 `t`만으로 그려져서 같은 `t`는 항상 같은 프레임이 됩니다.

## 스토리보드

| 시간 | 장면 | 내용 |
|---|---|---|
| 0.0–3.5 | 부팅 · 시계 눈 | CRT 전원선 → HUD 점등 → 60눈금 시계가 홍채가 되고 두 바늘이 겹쳐 세로 동공이 됨. `> open seoul-city-hall` |
| 3.5–6.0 | 미션 | 눈 깜빡임, "광장을 열고. 도서관을 밝히고. / 시민의 목소리를 가장 먼저 듣습니다." |
| 6.0–7.5 | 타이틀 | 방사형 하프톤 버스트 + **서울시청** / SEOUL CITY HALL |
| 7.5–8.5 | 열린 시청 | 초록 배경, 픽셀 블록 |
| 8.5–9.5 | 듣다. | 소리의 파문(동심원) |
| 9.5–10.5 | 잇다. | 두 파문의 간섭무늬 |
| 10.5–11.5 | 25 | 25개 자치구, 하프톤 구 |
| 11.5–14.5 | 시청역 | 지하철 터널, 역 이름 슬롯 → "시청", 1·2호선 배지, 도착 섬광 |
| 14.5–16.0 | 움직이다. | 픽셀 블록이 모여 눈이 됨 |
| 16.0–19.0 | 시민의 공간 | 서울광장 · 서울도서관 · 시민청 · 하늘광장 + 하프톤 마크 |
| 19.0–21.0 | 선언 | 열린 광장. 밝은 도서관. 시민 곁에. |
| 21.0–22.5 | 플립 | 흰 화면, 거대한 눈 → 마크가 쓸고 들어옴 |
| 22.5–26.0 | 로크업 | 마크 + 서울시청, Seoul City Hall, seoul.go.kr, 세종대로 110 |

컷은 120BPM(한 박 0.5초) 격자에 맞춰 두었고, `sound.py`가 같은 격자로 비트와 효과음을 만듭니다.

## 미리보기

```bash
cd motion/seoul-city-hall
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 을 열면 실시간으로 재생됩니다(재생/일시정지, 탐색 막대).
`?t=12.5` 를 붙이면 그 시각에서 시작합니다.

## 렌더

필요: Node 18+, ffmpeg, Playwright(+Chromium), Python 3 + numpy

```bash
python3 sound.py
```

```bash
node render.mjs --out out/seoul-city-hall_silent.mp4
```

```bash
ffmpeg -y -i out/seoul-city-hall_silent.mp4 -i out/sound.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/seoul-city-hall.mp4
```

특정 시각의 스틸만 뽑기: `node render.mjs --stills 6.5,13,24`

## 고치는 곳

- **색**: `index.html` 위쪽의 `C.accent` 한 줄로 전체 톤이 바뀝니다. (기본값은 시청역 2호선을 닮은 네온 그린)
- **문구**: 각 장면 함수(`sceneMission`, `sceneTitle`, `sceneSpaces` …) 안의 문자열을 바꾸면 됩니다.
- **길이·순서**: `T` 타임라인 값. 바꾸면 `sound.py`의 `T`도 같이 맞춰 주세요.
- **마무리 로고**: `assets/logo.png` 를 넣으면 마지막 장면이 마크+워드마크 대신 그 로고로 바뀝니다. 로고 왼쪽 심볼 위치가 다르면 `LOGO_SYMBOL`, 크기는 `LOGO_H` 로 맞춥니다.

## 참고

- 마크(물결 지붕 + 두 기둥 눈)는 신청사의 처마를 단순화해 이 영상을 위해 새로 그린 것으로, 서울시 공식 로고·캐릭터가 아닙니다. 실제로 쓸 때는 서울시 공식 CI 가이드에 맞춰 교체하세요.
- 사운드는 numpy로 합성한 가이드 트랙입니다. 최종본은 CapCut 등에서 BGM으로 교체하는 것을 권합니다.
- 폰트: Noto Sans KR, JetBrains Mono (SIL Open Font License, `fonts/OFL-*.txt`)
