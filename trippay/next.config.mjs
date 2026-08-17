/**
 * GitHub Pages는 정적 파일만 서빙하므로 정적 내보내기로 빌드한다.
 * 프로젝트 페이지는 https://<user>.github.io/<repo>/ 처럼 하위 경로에 붙어서
 * basePath를 같이 넣어야 링크와 정적 파일 경로가 맞는다.
 * 로컬 개발은 basePath 없이 루트에서 돌리려고 환경변수로 갈랐다.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // 정적 내보내기에는 next/image 최적화 서버가 없다
  images: { unoptimized: true },
  // /trip/new/index.html 로 떨어져야 새로고침·딥링크가 안 깨진다
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
