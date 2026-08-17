import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TripProvider } from "@/components/store";
import PhoneFrame from "@/components/PhoneFrame";

export const metadata: Metadata = {
  title: "TripFin — 소비 데이터로 떠나는 그룹 여행 금융 비서",
  description:
    "개인·그룹의 소비 패턴을 분석해 여행 예산과 일정을 추천하고, 여행 전·중·후 금융 활동을 함께하는 AI 금융 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // 노치·홈 인디케이터 영역까지 그리고, 안전 영역은 env()로 직접 띄운다
  viewportFit: "cover",
  themeColor: "#e9ebf2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TripProvider>
          <PhoneFrame>{children}</PhoneFrame>
        </TripProvider>
      </body>
    </html>
  );
}
