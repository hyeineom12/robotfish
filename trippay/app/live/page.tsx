"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTrip } from "@/components/store";
import { DESTINATION_MAP, CARD_MAP } from "@/lib/catalog";
import { overspendSignal, settle } from "@/lib/analysis";
import { MEMBER_MAP } from "@/lib/demo";
import { krw, krwShort, localMoney } from "@/lib/format";
import { Body, Card, Dot, Donut, Footer, Notice, Screen, SectionTitle, TopBar } from "@/components/ui";

export default function LiveHome() {
  const router = useRouter();
  const { state, set, members } = useTrip();
  const dest = state.destinationId ? DESTINATION_MAP[state.destinationId] : null;

  if (!dest || !state.confirmed) {
    return (
      <Screen>
        <TopBar title="여행 중" back="/trip/new" />
        <Body>
          <Notice tone="warn">아직 확정한 여행이 없어요. 일정을 먼저 확정해 주세요.</Notice>
          <Link href="/trip/new" className="btn-primary w-full">
            여행 만들러 가기
          </Link>
        </Body>
      </Screen>
    );
  }

  const days = state.nights + 1;
  const headcount = state.mode === "group" ? members.length : 1;
  const expenses = state.expenses;
  const totalSpentGroup = expenses.reduce((s, e) => s + e.krwAmount, 0);
  const res = settle(expenses, state.memberIds);
  const myShare = res.perPerson["me"] ?? 0;

  const dailyBudget = Math.round((state.budgetTotal - (state.budget?.flight ?? 0)) / days);
  const signal = overspendSignal(dailyBudget, myShare);
  const remain = state.budgetTotal - myShare;

  const bestCard = members
    .flatMap((m) => m.cardIds.map((id) => ({ m, c: CARD_MAP[id] })))
    .sort((a, b) => a.c.fxFeeRate - b.c.fxFeeRate)[0];

  const recent = [...expenses].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <Screen className="bg-surface">
      <TopBar
        title={`${dest.city} 여행 중`}
        subtitle={`${state.nights}박 ${state.nights + 1}일 · ${headcount}명`}
        right={
          <Link href="/settle" className="chip bg-surface text-ink-700">
            정산
          </Link>
        }
      />
      <Body>
        <Card>
          <div className="flex items-center gap-4">
            <Donut value={myShare / (state.budgetTotal || 1)} label="예산 사용" />
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-[11px] text-ink-500">내가 쓴 돈</div>
                <div className="text-[20px] font-bold leading-tight tabular-nums">{krw(myShare)}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-500">남은 예산</div>
                <div className={`text-[15px] font-bold tabular-nums ${remain < 0 ? "text-coral-500" : "text-mint-600"}`}>
                  {krw(remain)}
                </div>
              </div>
              <div className="text-[11px] text-ink-300">하루 {krwShort(dailyBudget)} 정도가 적당해요</div>
            </div>
          </div>
        </Card>

        <Notice
          tone={
            signal.level === "ok" ? "ok" : signal.level === "info" ? "info" : signal.level === "warn" ? "warn" : "danger"
          }
        >
          {signal.message}
        </Notice>

        <Card>
          <SectionTitle hint="실시간">환율</SectionTitle>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-[12px] text-ink-500">
                1 {dest.currency} = {dest.fxRate.toLocaleString("ko-KR")}원
              </div>
              <div className="text-[11px] text-ink-300">지출을 기록하면 원화로 바꿔드려요</div>
            </div>
            <span className="chip bg-mint-400/15 text-mint-600">어제보다 0.4% 내림</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map((v) => (
              <div key={v} className="rounded-xl bg-surface px-2 py-2 text-center">
                <div className="text-[11px] text-ink-500">{localMoney(v, dest.currencySymbol)}</div>
                <div className="text-[12.5px] font-bold tabular-nums">{krw(v * dest.fxRate)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-brand-700">
            이번 여행에선 {bestCard.m.name}님의 <b>{bestCard.c.name}</b>가 현금 환전보다 유리해요.
          </div>
        </Card>

        <Card>
          <SectionTitle hint={`${expenses.length}건`}>최근 지출</SectionTitle>
          {recent.length === 0 ? (
            <p className="mt-3 text-center text-[12.5px] text-ink-300">
              아직 기록한 지출이 없어요.
              <br />첫 지출을 남겨보세요.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <Dot category={e.category} size={10} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold">{e.merchant}</span>
                      {e.isTreat && <span className="chip bg-amber-50 text-amber-600">쏘기</span>}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {e.isTreat
                        ? `${MEMBER_MAP[e.payerId]?.name ?? "알 수 없음"}님이 전액 냈어요`
                        : `${MEMBER_MAP[e.payerId]?.name ?? "알 수 없음"} 결제 · ${e.participantIds.length}명이 나눠요`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold tabular-nums">{krw(e.krwAmount)}</div>
                    <div className="text-[10.5px] text-ink-300">{localMoney(e.localAmount, dest.currencySymbol)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-white/60 shadow-none">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-500">우리가 쓴 돈 전체</span>
            <span className="font-bold tabular-nums">{krw(totalSpentGroup)}</span>
          </div>
        </Card>
      </Body>
      <Footer>
        <div className="flex gap-2">
          <Link href="/live/expense" className="btn-primary flex-1">
            지출 기록하기
          </Link>
          <button
            onClick={() => {
              set({ tripEnded: true });
              router.push("/settle");
            }}
            className="btn-line flex-1"
          >
            여행 끝내기
          </button>
        </div>
      </Footer>
    </Screen>
  );
}
