# 2026 서울 시정 홍보 — 3D PPT · 웹페이지 · 나레이션

| 결과물 | 위치 |
|---|---|
| PPT 원본 (20장, 발표자 노트에 나레이션) | `seoul-promo/2026_서울_시정홍보_PPT.pptx` |
| 나레이션 대본 (txt) | `seoul-promo/2026_서울_시정홍보_나레이션_대본.txt` |
| 공모전 제출 정보 (AI 도구·프롬프트·시행착오) | `seoul-promo/공모전_제출정보.txt` |
| 웹 첫 화면 | `public/seoul-promo/index.html` |
| 3D 웹 프레젠테이션 | `public/seoul-promo/slides.html` (`#번호`로 해당 장 바로 열기) |

## 보는 방법
- 그냥 열기: `public/seoul-promo/index.html` 파일을 브라우저로 더블클릭 (인터넷 연결 없이도 동작)
- Next.js 사이트에서: `npm run dev` 후 `http://localhost:3000/seoul-promo/index.html`
- 슬라이드 조작: ← → / 스페이스 / 화면 클릭 / 스와이프, `M` 목차, `F` 전체화면

## 내용 고치기
1. `seoul-promo/content.py` 수정 (문구·숫자·나레이션 모두 여기 한 곳)
2. `python3 seoul-promo/build.py` 실행 → 웹 데이터, 3D 이미지, PPTX, txt가 함께 다시 만들어집니다
   (필요: python-pptx, Node.js + playwright)

## 게시 전 확인
- 로고는 **임시 이미지**입니다. `public/seoul-promo/assets/seoul-logo*.svg`를 서울시 공식 CI로 바꾸세요.
- 요금·일정 등 수치는 2026년 10월 기준 보도자료를 바탕으로 했습니다. 발표 전 seoul.go.kr에서 다시 확인하세요.
- PPT 글꼴은 `맑은 고딕`, 웹 글꼴은 Pretendard(OFL, `public/seoul-promo/fonts`)입니다.
