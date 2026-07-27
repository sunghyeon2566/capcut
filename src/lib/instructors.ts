// 강사진 데이터
//
// [순서]
// 아래 배열 순서가 메인 화면 강사 소개 라인에 보이는 순서입니다.
// 전달받은 사진 순서를 그대로 따랐습니다.
//
// [사진]
// photo 는 public/media/instructor-0*.svg 자리표시 이미지를 가리킵니다.
// 실제 사진을 같은 이름(확장자만 다르게)으로 넣고 경로만 바꾸면 반영됩니다.
//
// [직함·약력]
// title 과 bio 는 비워 두었습니다. 실제 인물의 이력을 임의로 채우지 않기
// 위한 것이며, 정보를 전달해 주시면 그대로 입력하겠습니다.
// 값이 없으면 화면에는 성명만 표시되고 레이아웃은 그대로 유지됩니다.

export interface Instructor {
  id: string;
  /** 강사 상세 페이지 주소(/instructors/[slug]) 및 앵커에 사용 */
  slug: string;
  name: string;
  /** 직함 — 미정이면 비워 둡니다 */
  title?: string;
  /** 전문 분야 — 미정이면 비워 둡니다 */
  specialty?: string;
  /** 약력 — 미정이면 비워 둡니다 */
  bio?: string;
  /** 인물 사진 경로 */
  photo: string;
}

export const INSTRUCTORS: Instructor[] = [
  { id: "ins-01", slug: "lee-iria", name: "이리아", photo: "/media/instructor-01.jpg" },
  { id: "ins-02", slug: "lee-sera", name: "이세라", photo: "/media/instructor-02.png" },
  { id: "ins-03", slug: "jin-hawon", name: "진하원", photo: "/media/instructor-03.jpg" },
  { id: "ins-04", slug: "yoo-hyunsim", name: "유현심", photo: "/media/instructor-04.jpg" },
  { id: "ins-05", slug: "cho-jaehyung", name: "조재형", photo: "/media/instructor-05.jpg" },
  { id: "ins-06", slug: "kim-jaemoon", name: "김재문", photo: "/media/instructor-06.jpg" },
  { id: "ins-07", slug: "moon-hoseon", name: "문호선", photo: "/media/instructor-07.png" },
  { id: "ins-08", slug: "sunghyeon", name: "성현쌤", photo: "/media/instructor-08.png" },
];

/** 메인 화면 강사 소개 라인 — 8인 전원을 한 줄에 노출합니다 */
export const FEATURED_INSTRUCTORS: Instructor[] = INSTRUCTORS;

/** 강사 인원수 — 사이트 문구에서 공용으로 사용 */
export const INSTRUCTOR_COUNT = INSTRUCTORS.length;
