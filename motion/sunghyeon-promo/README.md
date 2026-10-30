# 성현쌤 온라인 강사양성 쇼츠

레퍼런스 쇼츠(검은 교복 무리 속 흰 셔츠 한 명)의 구성을 그대로 따라, 검은 정장의 5060 부모님들 사이에 흰 셔츠의 성현쌤이 서는 세로 영상입니다.

- 결과물: `out/sunghyeon-promo.mp4` (1080×1920, 30fps, 29.5초, 음원 포함)
- 소스: `index.html` 한 파일. 모든 프레임은 시간 `t`만으로 그려집니다.

## 구성

| 시간 | 장면 | 자막 |
|---|---|---|
| 0.0–4.0 | 부모님 군중 설정 샷, 천천히 다가감 | 멈춰 있던 열정처럼 |
| 4.0–7.0 | 흰 셔츠의 성현쌤이 군중 사이로 걸어 나옴 | 당신 안의 이야기처럼 |
| 7.0–15.4 | 한가운데 선다. 10.6초 비트 인과 함께 위에서 빛 | 다시 타오르는 불꽃처럼 / 당당히 서서, 더 높이 / 계속해서, 끝까지, 함께 |
| 15.4–18.4 | 군중이 무너지고 혼자 서 있다 | |
| 18.4–24.0 | 클로즈업: 성현쌤 → 어머니 → 아버지 | |
| 24.0–29.5 | "Sunghyeon Class of 2026" 배너 샷, 중간에 클로즈업 | |

## 렌더

음원(`audio/song.m4a`)은 저장소에 올리지 않습니다. 같은 자리에 두고 렌더하세요.

```bash
node render.mjs --audio audio/song.m4a
```

스틸만: `node render.mjs --stills 5,12,16.5,25`

미리보기: `motion/` 폴더에서 `python3 -m http.server` 후 `http://localhost:8000/sunghyeon-promo/` (음원이 있으면 함께 재생)

## 고치는 곳

- 제목·태그·배너 문구: `COPY`
- 가사 자리 자막: `LYRICS` (곡의 가사 타이밍에 맞춰 둠)
- 회색 설명 박스: `NOTES`
- 컷 타이밍: `T`

## 소재

- `assets/protagonist-white-shirt.jpg`: 성현쌤 프로필 사진을 바탕으로 정장 재킷·넥타이를 흰 와이셔츠로 바꾼 생성 이미지
- `assets/parents-black-suits.jpg`: 검은 정장의 50대 어머니·아버지 단체 생성 이미지 (실존 인물 아님)
- `*-cut.webp`: 위 두 장에서 배경을 지운 컷아웃
- 폰트: Noto Sans KR(`../seoul-city-hall/fonts`), Montserrat, UnifrakturCook (SIL OFL, `fonts/OFL-*.txt`)
