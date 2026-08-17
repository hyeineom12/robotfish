"use client";

import Link from "next/link";
import { useTrip } from "@/components/store";
import { CATEGORY_MAP, DESTINATION_MAP } from "@/lib/catalog";
import { settle } from "@/lib/analysis";
import { MEMBER_MAP } from "@/lib/demo";
import { krw, localMoney } from "@/lib/format";
import { Avatar, Body, Card, Dot, Footer, LinkButton, Notice, Screen, SectionTitle, TopBar } from "@/components/ui";
import type { CategoryId } from "@/lib/types";

export default function SettlePage() {
  const { state } = useTrip();
  const dest = state.destinationId ? DESTINATION_MAP[state.destinationId] : null;
  const res = settle(state.expenses, state.memberIds);
  const ended = state.tripEnded;

  const byCategory = state.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.krwAmount;
    return acc;
  }, {} as Record<CategoryId, number>);
  const catRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = catRows[0]?.[1] ?? 1;

  if (state.expenses.length === 0) {
    return (
      <Screen>
        <TopBar title="정산" back="/live" />
        <Body>
          <Notice tone="info">아직 기록한 지출이 없어요. 지출을 먼저 남겨주세요.</Notice>
          <LinkButton href="/live/expense">지출 기록하러 가기</LinkButton>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface">
      <TopBar
        title={ended ? "정산 결과" : "정산 현황"}
        subtitle={`${dest?.city ?? ""} · 지출 ${state.expenses.length}건`}
        back="/live"
      />
      <Body>
        <Card className="bg-gradient-to-br from-ink-900 to-ink-700 text-white">
          <div className="text-[11px] text-white/70">우리가 쓴 돈</div>
          <div className="text-[28px] font-bold leading-tight tabular-nums">{krw(res.total)}</div>
          <div className="mt-1 text-[12px] text-white/70">
            한 사람당 평균 {krw(res.total / Math.max(1, state.memberIds.length))}
          </div>
        </Card>

        <Card>
          <SectionTitle hint="받을 돈과 낼 돈">사람별 정산</SectionTitle>
          <div className="mt-3 space-y-2.5">
            {state.memberIds.map((id) => {
              const m = MEMBER_MAP[id];
              if (!m) return null;
              const bal = res.balances[id] ?? 0;
              const share = res.perPerson[id] ?? 0;
              return (
                <div key={id} className="flex items-center gap-3">
<Avatar src={m.photo} name={m.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">
                      {m.name} {m.isMe && <span className="text-[11px] text-ink-300">(나)</span>}
                    </div>
                    <div className="text-[11px] text-ink-500">부담한 금액 {krw(share)}</div>
                  </div>
                  <div
                    className={`text-right text-[14px] font-bold tabular-nums ${
                      bal > 1 ? "text-mint-600" : bal < -1 ? "text-coral-500" : "text-ink-300"
                    }`}
                  >
                    {bal > 1 ? `+${krw(bal)}` : bal < -1 ? krw(bal) : "정산 완료"}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle hint={`${res.transfers.length}번만 보내면 돼요`}>이렇게 보내주세요</SectionTitle>
          {res.transfers.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-ink-500">더 보낼 돈이 없어요. 이미 딱 맞아요.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {res.transfers.map((t, i) =>
                !MEMBER_MAP[t.fromId] || !MEMBER_MAP[t.toId] ? null : (
                <div key={i} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5">
                  <Avatar src={MEMBER_MAP[t.fromId].photo} name={MEMBER_MAP[t.fromId].name} size={26} />
                  <span className="text-[12.5px] font-semibold">{MEMBER_MAP[t.fromId].name}</span>
                  <span className="text-ink-300">→</span>
                  <Avatar src={MEMBER_MAP[t.toId].photo} name={MEMBER_MAP[t.toId].name} size={26} />
                  <span className="text-[12.5px] font-semibold">{MEMBER_MAP[t.toId].name}</span>
                  <span className="ml-auto text-[13px] font-bold tabular-nums">{krw(t.amount)}</span>
                </div>
                )
              )}
            </div>
          )}
          {res.transfers.length > 0 && <button className="btn-ghost mt-3 w-full">송금 요청 보내기</button>}
        </Card>

        <Card>
          <SectionTitle>어디에 많이 썼을까요?</SectionTitle>
          <div className="mt-3 space-y-2.5">
            {catRows.map(([cat, v]) => {
              const c = CATEGORY_MAP[cat as CategoryId];
              return (
                <div key={cat} className="flex items-center gap-2.5">
                  <span className="flex w-[86px] shrink-0 items-center gap-1.5 text-[12px]">
                    <Dot category={cat as CategoryId} />
                    <span className="truncate">{c.label}</span>
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full" style={{ width: `${(v / maxCat) * 100}%`, background: c.color }} />
                  </div>
                  <span className="w-16 shrink-0 text-right text-[11.5px] font-semibold tabular-nums">{krw(v)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle hint={`${state.expenses.length}건`}>지출 내역</SectionTitle>
          <div className="mt-3 space-y-2">
            {[...state.expenses]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((e) => (
                <div key={e.id} className="flex items-center gap-2.5 border-b border-black/5 pb-2 last:border-0">
                  <Dot category={e.category} size={10} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold">{e.merchant}</span>
                      {e.isTreat && <span className="chip bg-amber-50 text-amber-600">쏘기</span>}
                    </div>
                    <div className="text-[10.5px] text-ink-500">
                      {e.isTreat
                        ? `${MEMBER_MAP[e.payerId]?.name}님이 전액 부담`
                        : `${MEMBER_MAP[e.payerId]?.name} 결제 · ${e.participantIds.length}명`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12.5px] font-bold tabular-nums">{krw(e.krwAmount)}</div>
                    {dest && (
                      <div className="text-[10px] text-ink-300">{localMoney(e.localAmount, dest.currencySymbol)}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </Body>
      <Footer>
        {ended ? (
          <LinkButton href="/review">여행 리포트 보기</LinkButton>
        ) : (
          <div className="flex gap-2">
            <Link href="/live" className="btn-line flex-1">
              돌아가기
            </Link>
            <Link href="/live/expense" className="btn-primary flex-1">
              지출 기록하기
            </Link>
          </div>
        )}
      </Footer>
    </Screen>
  );
}
