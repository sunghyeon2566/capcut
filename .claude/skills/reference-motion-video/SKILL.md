---
name: reference-motion-video
description: Make a polished motion-graphic video (MP4 with soundtrack) in the style of a reference video, about the user's own topic and content. Analyzes the reference's layout, palette, typography, transitions, chapter timing and beat, maps the user's content (landing page, PDF, notes, brand info, photos, logo) onto that structure, rebuilds it as a deterministic HTML-canvas animation, renders it frame by frame with headless Chromium + ffmpeg, and synthesizes a beat-synced sound track. Use this whenever someone attaches or links a reference video and wants "a video like this" for their brand, lecture, event, product, institution or shorts — 모션그래픽, 홍보영상, 인트로, 런칭 필름, 쇼츠, 특강 홍보, "이 레퍼런스처럼 만들어 줘" — even if they never say "motion graphics". Not for cutting/editing existing live-action footage or for pure AI text-to-video generation.
---

# 레퍼런스 영상으로 모션그래픽 만들기

입력 세 가지(레퍼런스 영상, 주제, 내용)로 레퍼런스와 같은 문법의 새 영상을 만든다.
결과물은 `out/*.mp4` 한 편과, 언제든 문구를 고쳐 다시 렌더할 수 있는 소스 폴더다.

왜 이 방식인가: 장면을 코드(캔버스)로 그리고 모든 프레임을 시간 `t`만으로 결정하면,
레퍼런스의 타이밍을 프레임 단위로 맞출 수 있고, 글자·숫자가 정확하며, 수정이 "문구 한 줄 바꾸고 다시 렌더"로 끝난다.
AI 영상 생성처럼 결과가 매번 달라지지 않는다.

이 스킬 폴더의 도구:

| 파일 | 하는 일 |
|---|---|
| `scripts/analyze_reference.sh` | 레퍼런스 규격·컷 시점·2fps 콘택트 시트·키 프레임·소리(음량/템포/온셋) 추출 |
| `scripts/audio_profile.py` | 음원 하나의 템포·드롭·온셋 (사용자 음악에 컷을 맞출 때) |
| `scripts/new_project.sh` | 새 프로젝트 폴더: 템플릿 `index.html`·`sound.py`, `render.mjs`, `sound_kit.py`, 기본 폰트 |
| `scripts/fetch_fonts.sh` | Google Fonts 정적 TTF 받기(한글 포함) + OFL 라이선스 |
| `scripts/render.mjs` | 스틸 PNG 또는 전체 MP4 렌더(4워커, x264 CRF 22, `--audio` 합치기) |
| `scripts/sound_kit.py` | numpy 합성 악기·효과음·믹서(`Mix.beat_bed`, `place`, `write`) |
| `references/style-recipes.md` | 검증된 스타일 3종의 기법과 수치 → `references/examples/*.html` 완성 코드 |
| `references/quality-checklist.md` | 실제로 겪은 문제와 해법(가독성, 사실 확인, 로고, 용량 …) |

## 0. 재료와 환경 확인

필요한 것:
- **레퍼런스 영상 파일.** 유튜브 등 링크만 있으면 샌드박스에서 못 받는 경우가 많다. 파일 첨부를 부탁하라.
- **주제와 내용.** 랜딩페이지 링크, PDF, 메모, 이미지 모두 된다. 이미지 안의 글자도 직접 읽어서 쓴다.
- **선택 재료.** 공식 로고 원본, 인물 사진, 쓰고 싶은 음악. 없으면 진행하되 무엇을 대신했는지 마지막에 알린다.

환경을 한 번에 점검한다:

```bash
node -v; ffmpeg -version | head -1; python3 -c "import numpy; print('numpy ok')"; node -e "require('playwright'); console.log('playwright ok')"
```

없으면 설치한다(`npm i -D playwright && npx playwright install chromium`, `pip install numpy`).
링크가 네트워크 정책으로 막히면 막힌 호스트 이름을 알려 주고, 그 부분만 빼고 계속 진행한다.
막힌 내용을 짐작으로 채우지 않는다.

## 1. 레퍼런스 분석

```bash
bash <skill>/scripts/analyze_reference.sh <reference.mp4> <work>/ref
```

`sheet_*.jpg`, `frames/*.jpg` 를 직접 보고, `cuts.txt`·`audio.txt` 를 읽어 **스타일 시트**를 머릿속(또는 메모)에 정리한다.

- **규격:** 해상도, 길이, 세로인지 가로인지
- **색:** 배경, 강조, 보조, 글자색(hex)
- **글자:** 제목/본문/라벨 각각의 느낌(굵은 그로테스크, 둥근 고딕, 모노, 세리프 …)과 크기
- **배치:** 안전 여백, 제목 위치, 반복되는 HUD·라벨·진행 표시
- **움직임 어휘:** 글자 등장 방식, 카운터, 그래프, 도트, 패럴랙스, 카메라 푸시
- **전환:** 하드컷, 글리치, 와이프 모양, 섬광
- **챕터 표:** 시각 · 화면에 하는 일(예 `0–3 로고`, `3–8 연혁 타임라인` …)
- **소리:** 템포(BPM)와 컷이 박에 맞는지, 드롭 시각

자막이나 숫자가 바뀌는 정확한 시각이 필요하면 그 영역만 4fps로 잘라 타일로 본다.

```bash
ffmpeg -i ref.mp4 -vf "fps=4,crop=W:h:0:y,scale=432:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=white:box=1,tile=4x20" -frames:v 1 cap.jpg
```

레퍼런스가 `references/style-recipes.md` 의 세 스타일 중 하나와 닮았으면 그 절과 예시 코드를 지금 읽는다.

## 2. 내용 → 챕터 매핑

레퍼런스의 **구조와 리듬은 그대로 두고 내용만 바꾼다.** 사용자가 이 영상을 고른 이유가 그 리듬이기 때문이다.
예: 연혁 타임라인 → 문제 제기 3가지, 작동 방식 4단계 → 강의 4단계, 실적 숫자 → 수강생 수, 매출 그래프 → 전후 비교, 로고 → 날짜·참여 안내.

- 화면 글자는 짧게: 제목 한 줄, 설명 한 줄, 항목은 3~4개.
- **숫자·날짜·이름은 자료에 있는 것만** 쓴다. 그럴듯한 통계를 지어내지 않는다. 없으면 숫자 없는 장면으로 바꾼다.
- 기관·회사의 공식 로고가 없으면 단순한 마크를 새로 그리고, 공식 로고가 아님을 알린다.
- 막히는 게 없으면 묻지 말고 진행하고, 가정한 것은 마지막에 적는다.

## 3. 프로젝트 만들기

```bash
bash <skill>/scripts/new_project.sh <project_dir>
```

`index.html` 의 맨 위 설정부터 채운다.
- **기본값:** `W/H/FPS/DUR`, 챕터 시각 `T`, 장면 이름 `LABEL`, 팔레트 `C`, 문구 `COPY`, `HUD` 켜기·끄기
- **장면 함수:** `scene*(lt, d, t)` 를 챕터마다 하나씩 쓰고 `SCENES` 에 등록한다.
- **전환:** `render()` 안에서 경계 시각에 맞춰 부른다.

템플릿에 이미 있는 도우미:
- **글자:** `text/rich/measure/wrap/rise/typed/eyebrow/scrim`
- **배경·질감:** `bg/dust/grain/vignette/halftone`
- **전환:** `stripeWipe/circleWipe/stairWipe/flash/glitch`
- **HUD:** `hud`

장면 코드에서 지킬 것(이유와 함께):
- **모든 것을 `t` 의 함수로.** `Math.random`, `Date`, 프레임 간 누적 상태를 쓰지 않는다. 렌더러가 4개 워커로 프레임을 나눠 그리기 때문에, 같은 `t`가 같은 그림이 아니면 영상이 튄다. 무작위는 `hash(i)` 로 한다.
- **등장은 `rise(k, …)` 로.** 진행도 `k = prog(lt, a, b)` 를 쓰고, 항목마다 0.2~0.4초씩 늦춘다. 이렇게 하면 레퍼런스처럼 "착착" 들어온다.
- **글자 폭은 `measure()` 로 재서 배치한다.** 캔버스는 줄바꿈도 정렬 보정도 해 주지 않는다.
- **이미지와 사진은 `loadImage()` 로 `boot()` 에서 미리 읽는다.**
  - 인물 컷아웃: `pip install rembg onnxruntime` 후 `birefnet-portrait` 모델을 쓰고 WebP로 저장한다.
  - 장면 톤 맞추기: `filter` 로 밝기·채도·대비를 맞추고 뒤 그림자를 준다.
- **폰트를 추가하려면** `fetch_fonts.sh` 로 받고 `@font-face`, `boot()` 의 `fonts.load` 에 함께 등록한다.

## 4. 스틸 검토 루프 — 전체 렌더 전에 꼭

각 챕터의 가운데와 각 전환의 한가운데 시각을 골라 스틸을 뽑고, 2×2나 2×3으로 이어 붙여 직접 본다.

```bash
node <project_dir>/render.mjs <project_dir> --stills 1.5,5.2,7.6,11.6,12.85,15.4
ffmpeg -y -i out/still_1.50.png -i out/still_5.20.png -i out/still_7.60.png -i out/still_11.60.png \
  -filter_complex "[0]scale=960:-1[a];[1]scale=960:-1[b];[2]scale=960:-1[c];[3]scale=960:-1[d];[a][b]hstack[x];[c][d]hstack[y];[x][y]vstack" grid.jpg
```

`references/quality-checklist.md` 를 위에서부터 대조하고 고친 뒤, 고친 장면만 다시 스틸로 확인한다.
여기서 잡는 것이 전체 렌더(분 단위)를 여러 번 돌리는 것보다 훨씬 싸다.

## 5. 사운드

- **음악이 없을 때:** `sound.py` 를 고쳐 가이드 트랙을 합성한다(`python3 sound.py` → `out/sound.wav`).
  - `Mix.beat_bed(start, end, bpm)` 로 기본 비트를 깐다.
  - 전환에는 `whoosh/impact/thud`, 등장에는 `pop`, 카운터에는 `tick`, 엔딩에는 `bell` 화음을 놓는다.
  - 시각은 `index.html` 의 `T` 와 같은 값을 쓴다. 컷은 박 격자(120BPM이면 0.5초)에 둔다.
- **사용자 음악이 있을 때:** `audio_profile.py` 로 템포와 드롭을 찾아 `T` 를 그 박에 맞추고, 렌더할 때 `--audio` 로 넣는다.
  - 상업 음원은 게시할 때 제한될 수 있음을 알린다.
  - 음원 파일은 커밋하지 않는다.
- 합성 트랙은 "가이드"다. 최종 BGM은 편집 툴에서 바꿀 수 있다고 알려 준다.

## 6. 최종 렌더와 전달

```bash
node <project_dir>/render.mjs <project_dir> --audio out/sound.wav --out out/<name>.mp4
ffmpeg -y -i out/<name>.mp4 -vf "fps=2,scale=320:-1,tile=6x10:padding=2" -frames:v 1 sheet.jpg
```

콘택트 시트로 처음부터 끝까지 흐름을 한 번 더 보고 전달한다.
- **전달:** 파일 전송 도구가 있으면 MP4를 직접 보낸다. 저장소 작업이면 소스와 MP4를 커밋하고 README를 남긴다.
  README에는 구성 표, 렌더 명령, 고치는 곳(`COPY`·`T`·`C`)을 적는다.
- **웹 페이지에 올릴 때:** 2-pass 4Mbps로 15MB 이하 버전을 따로 만든다.
- **마지막 보고:** 짧게 쓴다. 장면 구성 표, 사용자가 확인할 것(직접 그린 로고, 비운 숫자, 음원 저작권 등), 바꾸기 쉬운 곳을 담는다.
