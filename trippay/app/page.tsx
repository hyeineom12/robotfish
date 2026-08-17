"use client";

import Link from "next/link";
import { useTrip } from "@/components/store";
import { Body, Screen } from "@/components/ui";

const FEATURES = [
  { t: "소비 성향 분석", d: "카드 내역으로 여행 취향을 파악해요" },
  { t: "예산 여력 계산", d: "자산과 저축 흐름으로 안전한 예산을 알려줘요" },
  { t: "결제 룰렛과 정산", d: "그룹 지출을 재미있고 공정하게 나눠요" },
  { t: "여행 후 재학습", d: "이번 여행 기록이 다음 추천에 반영돼요" },
];

export default function Onboarding() {
  const { state, reset } = useTrip();

  return (
    <Screen className="bg-gradient-to-b from-brand-600 via-brand-500 to-brand-400 text-white">
      <Body className="flex flex-col justify-between pt-16">
        <div>
          <div className="mb-6 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold">
            2026 금융 AI Challenge
          </div>
          <h1 className="text-[30px] font-bold leading-[1.25]">
            내 소비가
            <br />
            다음 여행을 정해요
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/80">
            카드 소비 패턴으로 취향과 예산을 파악하고,
            <br />
            여행 전부터 정산까지 함께해요.
          </p>

          <div className="mt-8 space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-2xl bg-white/12 px-3.5 py-3">
                <div className="text-[13.5px] font-semibold">{f.t}</div>
                <div className="text-[11.5px] text-white/70">{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 pt-8">
          <Link href="/connect" className="btn w-full bg-white text-brand-700 hover:bg-white/90">
            시작하기
          </Link>
          {state.connected && (
            <button onClick={reset} className="btn w-full bg-white/10 text-white hover:bg-white/20">
              처음부터 다시하기
            </button>
          )}
          <p className="pt-1 text-center text-[11px] text-white/60">
            데모 계정으로 시작해요. 모든 금융 데이터는 가상이에요.
          </p>
        </div>
      </Body>
    </Screen>
  );
}
