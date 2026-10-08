# 조선시대 웹툰 장면 이미지 제작 (작업 이어가기용)

새 Claude 세션에서 이 파일을 읽고 아래 작업을 그대로 진행하면 됩니다.

## 요청 내용
- 아래 Hook Prompt 01~10을 Higgsfield로 이미지 생성
- 16:9 10장 → 파일명 `롱폼1.png` ~ `롱폼10.png`
- 9:16 10장 → 파일명 `숏폼1.png` ~ `숏폼10.png`
- 완성 후 ZIP으로 묶어 전달 (채팅 전송 한도 30MB → 롱폼/숏폼 ZIP 2개로 나눔)

## 스타일
- 실사 X. **조선시대 배경 한국 사극 웹툰(만화) 스타일**
- 참고 이미지: `style_ref.jpg` (원본 설정표에서 일러스트 부분만 잘라낸 것), 원본은 `style_ref_full.jpg`
- `style_ref_full.jpg`를 그대로 넣으면 설정표 레이아웃(글자, 칸 나눔)까지 따라 그리므로 `style_ref.jpg`를 사용

## 검증된 설정
- 모델: `gpt_image_2` + 참고 이미지(`medias` role `image`) — 화풍이 가장 잘 맞았음
  - `soul_2`는 참고 이미지의 자세·구도를 그대로 베끼거나 레이아웃을 따라 해서 부적합
- 업로드: `media_upload` → PUT 시 `-H "If-None-Match: *"` 헤더 필요 → `media_confirm`
- 네트워크 허용 도메인: `d8j0ntlcm91z4.cloudfront.net`(다운로드), `upload.higgsfield.ai`(업로드)
- 무료 플랜은 동시 생성 1건 제한이 있었음 (Plus 플랜이면 배치 가능할 수 있음)
- 9번 장면은 원문 그대로 넣으면 콘텐츠 필터(nsfw)에 걸린 적이 있음 → 아래 9번은 수정본

## 프롬프트 앞에 붙이는 스타일 문구
```
Draw a completely new illustration in exactly the same art style as the reference image (Korean historical manhwa webtoon: detailed ink pen lineart, soft watercolor shading, warm sepia and muted brown palette). Do NOT reuse the reference man, his pose or composition. No text, no captions. Scene:
```

## 장면 프롬프트
1. High-angle wide shot of a Joseon county office back courtyard at autumn dusk, falling leaves, torches being lit. Manseok, 32-year-old clean-shaven Korean man, broad square face, thick straight eyebrows, sun-darkened skin, tall very muscular build, black topknot with faded gray headcloth, torn patched brown hemp jeogori, tied face-down on a wooden punishment bench, gripping it with bulging veins, eyes shut tight. A Joseon jailer in dark clothes raises a long flat wooden paddle above him, frozen just before the strike.
2. Low-angle medium shot of Hwang Hyangri, 50-year-old heavy-set county clerk, jowly wide face, small cruel bloodshot eyes, thick black mustache, black horsehair hat, dark brown official robe with black belt, standing at the edge of a wooden hall and pointing down while shouting. Red torchlight from below, autumn night, an angry and desperate expression.
3. Extreme close-up at ground level of Manseok, 32-year-old Korean man, broad square face, thick straight eyebrows, small kind eyes, sun-darkened bruised skin, black topknot with faded gray headcloth, his cheek pressed against the dirt among dry autumn leaves, eyes half open, a faint determined smile, dust and torchlight.
4. Rear-view wide shot at early spring sunset on a dirt road from a market to a village. Manseok, 32-year-old tall very muscular Korean man, black topknot with faded gray headcloth, patched faded brown hemp jeogori and baji, straw sandals, walking alone with a wooden A-frame jige piled high with firewood and a straw mat. A long silhouette, a thatched hut far away, bare willow trees.
5. Foreground-background composition on a spring dirt road. In the foreground, Jeongin, 8-year-old Korean boy, round tear-streaked face, big bright eyes, small mole under left eye, thin small build, long black single braid, torn dirty pale-blue silk jeogori and gray baji, barefoot, hugging the leg of Manseok, 32-year-old tall muscular man with square face, thick eyebrows, gray headcloth, patched brown hemp clothes and an A-frame jige, who looks down startled. In the background, Joseon soldiers in dark blue uniforms and black felt hats with red tassels run over a hill with spears, raising dust.
6. Object close-up at night inside a humble thatched hut lit by a single oil lamp. The small hands of a sleeping 8-year-old boy in a pale-blue jeogori tightly clutch a half wooden tally hanging on a red cord, half of a carved Chinese character visible on the cut edge, a warm flickering glow, rough straw mat beneath.
7. Over-the-shoulder shot from behind gossiping villagers in off-white hemp clothes under a large ginkgo tree at the edge of an autumn field, whispering and pointing. In the distance, Manseok, 32-year-old tall muscular man with square face, thick eyebrows, gray headcloth and patched brown hemp clothes, shields Jeongin, 8-year-old boy with round face, mole under left eye, long braid, pale-blue jeogori and half wooden tally on red cord, behind his back.
8. Extreme wide shot from the roof of a Joseon county office on a late autumn day. Hundreds of commoners in white and off-white hanbok fill the courtyard and press against the stone walls, standing on tiptoe and facing the main hall with tiled roof, elderly women with hands clasped, tense atmosphere, clear pale sky.
9. (필터 회피 수정본) Foreground-background composition in front of a Joseon county main hall with tiled roof, daytime. In the foreground, a young Korean boy in a pale-blue hanbok jeogori with a long braid raises his hand high, proudly holding up a half wooden tally on a red cord. Beside him stands a tall strong Korean commoner in a gray headcloth and brown hemp clothes, arms wrapped in white cloth. In the blurred background, a heavy-set Joseon county clerk with a mustache, black horsehair gat hat and dark brown official robe steps back in shock, face pale.
10. Extreme close-up on red silk cloth atop a wooden table in a Joseon magistrate hall. Two halves of an old wooden tally almost touch, separated by a finger-width gap, the carved half-characters about to align. The dignified hand of a magistrate in a deep blue danryeong sleeve brings one half closer. Dramatic soft light, a breathless suspended moment.
