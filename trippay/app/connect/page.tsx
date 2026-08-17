"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTrip } from "@/components/store";
import { Body, Card, Footer, Notice, Screen, TopBar } from "@/components/ui";
import { krw } from "@/lib/format";

export default function Connect() {
  const router = useRouter();
  const { set, myTransactions } = useTrip();
  const [loading, setLoading] = useState(false);

  const total = myTransactions.reduce((s, t) => s + t.amount, 0);

  const goDemo = () => {
    setLoading(true);
    set({ connected: true, source: "demo" });
    setTimeout(() => router.push("/profile"), 900);
  };

  return (
    <Screen>
      <TopBar title="소비 데이터 연결" subtitle="최근 6개월 내역으로 소비 성향을 분석해요" back="/" />
      <Body>
        <Notice tone="info">
          카테고리와 금액만 확인해요. 계좌번호와 카드번호는 저장하지 않아요.
        </Notice>

        <button onClick={goDemo} disabled={loading} className="w-full text-left">
          <Card className="border-2 border-brand-500 transition hover:bg-brand-50/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold">데모 데이터로 체험하기</div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                  가상 거래내역 {myTransactions.length}건으로 바로 시작해요
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-300">6개월 · 총 {krw(total)}</p>
              </div>
              <span className="chip bg-brand-600 text-white">바로 시작</span>
            </div>
          </Card>
        </button>

        <button onClick={() => router.push("/connect/bank")} disabled={loading} className="w-full text-left">
          <Card className="transition hover:bg-surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold">내 계좌 연결하기</div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                  실제 은행·카드 내역을 불러와서 분석해요
                </p>
              </div>
              <span className="text-[18px] text-ink-300">›</span>
            </div>
          </Card>
        </button>
      </Body>
      <Footer>
        {loading ? (
          <div className="btn-primary w-full">
            <span className="animate-pulse">소비 내역을 분석하고 있어요</span>
          </div>
        ) : (
          <p className="pb-1 text-center text-[12px] text-ink-300">연결 방법을 선택해 주세요</p>
        )}
      </Footer>
    </Screen>
  );
}
