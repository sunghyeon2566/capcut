# 이미지 · 영상 에셋 넣는 곳

이 폴더에 실제 파일을 넣으면 사이트에 바로 반영됩니다.
경로는 `src/lib/assets.ts` 와 `src/lib/instructors.ts` 에서 관리합니다.

## 원본 파일 대응표

원본은 구글 드라이브 '클라우드 작업소' 폴더
(`https://drive.google.com/drive/folders/1hN9wAzdS-8rxP0OvYlrwwWiCvwOhlZaX`)
에 있습니다. 아래 이름으로 이 폴더에 올리면 됩니다.

| 드라이브 원본 | 이 폴더에 올릴 이름 | 원본 형식 · 용량 |
| --- | --- | --- |
| 협회 홈피 메인 영상.mp4 | `hero.mp4` | MP4 · 2.0MB |
| 이리아 프로필 사진.png | `instructor-01.png` | JPEG · 7.0MB |
| 이세라 프로필 사진.jpg | `instructor-02.jpg` | PNG · 0.75MB |
| 진하원 프로필 강사.png | `instructor-03.png` | JPEG · 7.1MB |
| 유현심 프로필 사진.png | `instructor-04.png` | JPEG · 6.6MB |
| 조재형 프로필 사진.png | `instructor-05.png` | JPEG · 7.7MB |
| 김재문 프로필 사진.png | `instructor-06.png` | JPEG · 7.4MB |
| 문호선 프로필 사진.png | `instructor-07.png` | PNG · 0.78MB |
| 성현쌤 프로필.png | `instructor-08.png` | PNG · 0.21MB |

사진 여러 장이 7MB 내외입니다. 메인의 강사 패널은 폭 155px 로 표시되므로
장당 300~600KB 로 줄여도 화질 차이가 없고 로딩이 훨씬 빨라집니다.
확장자와 실제 형식이 어긋난 파일도 있으니(`.png` 이지만 내용은 JPEG)
줄이면서 함께 정리하면 좋습니다. 그대로 올려도 화면은 정상 동작합니다.

## 지금 채워야 하는 파일

| 파일명 | 내용 | 현재 상태 |
| --- | --- | --- |
| `hero.gif` 또는 `hero.mp4` | 메인 상단 배경 (둘 중 하나만) | **없음** — 넣어야 함 |
| `logo.png` | 협회 로고 원본 | 없음 (SVG로 재현해 둔 `logo.svg` 사용 중) |
| `instructor-01.<확장자>` | 이리아 | 없음 (자리표시 SVG 사용 중) |
| `instructor-02.<확장자>` | 이세라 | 없음 (자리표시 SVG 사용 중) |
| `instructor-03.<확장자>` | 진하원 | 없음 (자리표시 SVG 사용 중) |
| `instructor-04.<확장자>` | 유현심 | 없음 (자리표시 SVG 사용 중) |
| `instructor-05.<확장자>` | 조재형 | 없음 (자리표시 SVG 사용 중) |
| `instructor-06.<확장자>` | 김재문 | 없음 (자리표시 SVG 사용 중) |
| `instructor-07.<확장자>` | 문호선 | 없음 (자리표시 SVG 사용 중) |
| `instructor-08.<확장자>` | 성현쌤 | 없음 (자리표시 SVG 사용 중) |

## 넣는 방법

### 1. 메인 배경 (GIF 또는 영상)

GIF 와 MP4 둘 다 지원합니다. **변환은 필수가 아닙니다.**
파일을 넣고 `src/lib/assets.ts` 의 `HERO_MEDIA` 값만 바꾸면 됩니다.

| 넣은 파일 | `HERO_MEDIA` 값 |
| --- | --- |
| 아직 없음 | `"poster"` (현재 값) |
| `hero.gif` | `"gif"` |
| `hero.mp4` | `"video"` |

GIF 를 그대로 넣어도 반복 재생됩니다. 다만 GIF 는 압축 효율이 낮아
같은 화면이라도 MP4 보다 파일이 훨씬 큽니다. 원본이 5MB 를 넘으면
아래 명령으로 MP4 로 바꾼 뒤 넣는 편이 로딩이 빠릅니다.

```bash
ffmpeg -i 원본.gif -movflags faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" public/media/hero.mp4
```

배경으로 쓰이므로 어느 쪽이든 소리는 재생되지 않습니다.

### 2. 강사 사진

위 표의 번호대로 넣고, `src/lib/instructors.ts` 의 `photo` 경로를
넣은 파일 확장자에 맞게 바꿉니다. 번호가 곧 화면에 보이는 순서입니다.

세로로 긴 인물 사진(3:4 비율)이 가장 잘 맞습니다. 메인의 강사 패널은
평소 폭이 좁기 때문에 좌우가 잘리는데, 얼굴이 화면 위쪽 1/3 지점에
오도록 `object-position: 50% 22%` 로 맞춰 두었습니다. 얼굴이 사진의
정중앙보다 아래에 있는 사진은 이 값을 조정해야 할 수 있습니다.

권장 크기는 가로 600px 이상입니다.

### 3. 로고

`logo.png` 로 넣고 `src/lib/assets.ts` 의 `ASSETS.logo` 를
`/media/logo.png` 로 바꿉니다. 배경이 투명한 PNG 를 권합니다.
