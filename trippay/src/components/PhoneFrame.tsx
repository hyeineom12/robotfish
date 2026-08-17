"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { match: ["/"], label: "시작" },
  { match: ["/connect", "/connect/bank"], label: "데이터 연결" },
  { match: ["/profile"], label: "소비 프로파일" },
  { match: ["/trip/new", "/trip/group", "/trip/group-profile"], label: "여행 설계" },
  { match: ["/trip/recommend", "/trip/itinerary"], label: "예산·일정" },
  { match: ["/live", "/live/expense"], label: "여행 중" },
  { match: ["/settle", "/review"], label: "정산·회고" },
];

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeIdx = STEPS.findIndex((s) => s.match.includes(pathname));

  return (
    <div className="flex min-h-[100svh] w-full justify-center gap-10 frame:px-4 frame:py-6 lg:py-12">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-12">
          <div className="mb-1 text-[22px] font-bold tracking-tight">TripFin</div>
          <p className="mb-6 text-[13px] leading-relaxed text-ink-500">
            소비 데이터가 여행을 추천하고,
            <br />
            여행 기록이 다시 소비를 이해해요.
          </p>
          <div className="label mb-3">화면 흐름</div>
          <ol className="space-y-1.5">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${
                  i === activeIdx ? "bg-white font-semibold text-brand-700 shadow-card" : "text-ink-500"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    i === activeIdx ? "bg-brand-600 text-white" : "bg-white text-ink-300"
                  }`}
                >
                  {i + 1}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[11px] leading-relaxed text-ink-500">
            2026 금융 AI Challenge · MVP 프로토타입
            <br />
            모든 금융 데이터는 가상 데이터예요.
          </p>
        </div>
      </aside>

      {/* 목업 크기는 iPhone 16 논리 해상도(393 × 852pt)에 맞춘다 */}
      <main className="w-full frame:max-w-[393px]">
        <div className="relative bg-white frame:overflow-hidden frame:rounded-[44px] frame:border-[10px] frame:border-ink-900 frame:shadow-2xl">
          {/* 다이내믹 아일랜드는 목업일 때만. 실제 폰에는 진짜 노치가 있다 */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden h-7 w-28 -translate-x-1/2 rounded-full bg-ink-900 frame:block" />
          <div className="min-h-[100svh] frame:h-[852px] frame:min-h-[852px] frame:overflow-y-auto frame:no-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
