/**
 * public/ 아래 정적 파일 경로에 basePath를 붙인다.
 * next/image는 basePath를 알아서 붙이지만 직접 쓴 <img src="/...">는 그대로 나가서
 * GitHub Pages처럼 하위 경로에 배포하면 404가 된다.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
