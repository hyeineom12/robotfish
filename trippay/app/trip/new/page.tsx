"use client";

import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useTrip } from "@/components/store";
import { Body, Card, Footer, Screen, SectionTitle, TopBar } from "@/components/ui";
import { dateLabel } from "@/lib/format";

export default function NewTrip() {
  const router = useRouter();
  const { state, set } = useTrip();

  const pick = (mode: "solo" | "group") => {
    set({ mode, memberIds: mode === "solo" ? ["me"] : state.memberIds });
    router.push(mode === "solo" ? "/trip/recommend" : "/trip/group");
  };

  return (
    <Screen>
      <TopBar title="여행 만들기" subtitle="언제, 며칠, 누구와 떠날지 정해 주세요" back="/profile" />
      <Body>
        <SectionTitle hint={`${state.nights}박 ${state.nights + 1}일`}>언제 떠나나요?</SectionTitle>
        <DateRangePicker
          startDate={state.startDate}
          nights={state.nights}
          onChange={(startDate, nights) => set({ startDate, nights })}
        />

        <SectionTitle>누구와 가나요?</SectionTitle>
        <button onClick={() => pick("solo")} className="w-full text-left">
          <Card className="transition hover:bg-surface">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">혼자 가요</div>
                <p className="mt-0.5 text-[12px] text-ink-500">내 소비 성향과 예산으로 추천받아요</p>
              </div>
              <span className="text-[18px] text-ink-300">›</span>
            </div>
          </Card>
        </button>

        <button onClick={() => pick("group")} className="w-full text-left">
          <Card className="border-2 border-brand-500 transition hover:bg-brand-50/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold">같이 가요</span>
                  <span className="chip bg-brand-600 text-white">추천</span>
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                  카드 혜택 비교, 결제 룰렛, 정산까지 함께 써요
                </p>
              </div>
              <span className="text-[18px] text-ink-300">›</span>
            </div>
          </Card>
        </button>
      </Body>
      <Footer>
        <p className="pb-1 text-center text-[12px] text-ink-300">
          {dateLabel(state.startDate)} 출발 · {state.nights}박 {state.nights + 1}일
        </p>
      </Footer>
    </Screen>
  );
}
