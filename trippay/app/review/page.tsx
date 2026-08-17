"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTrip } from "@/components/store";
import { CATEGORY_MAP, DESTINATION_MAP, PROFILES } from "@/lib/catalog";
import { categoryShares, classifyProfile, settle } from "@/lib/analysis";
import { krw, pct } from "@/lib/format";
import {
  AiBadge,
  Body,
  Card,
  CategoryBar,
  Footer,
  Notice,
  Screen,
  SectionTitle,
  Stat,
  TopBar,
} from "@/components/ui";
import type { CategoryId, Transaction } from "@/lib/types";

export default function ReviewPage() {
  const { state, reset, myShares, myProfile } = useTrip();
  const dest = state.destinationId ? DESTINATION_MAP[state.destinationId] : null;
  const res = settle(state.expenses, state.memberIds);
  const myShare = res.perPerson["me"] ?? 0;

  const tripTx: Transaction[] = state.expenses.map((e) => ({
    id: e.id,
    date: new Date(e.createdAt).toISOString().slice(0, 10),
    merchant: e.merchant,
    category: e.category,
    amount: e.krwAmount / Math.max(1, e.participantIds.length),
  }));
  const tripShares = useMemo(() => categoryShares(tripTx), [tripTx]);

  const updatedShares = useMemo(() => {
    const merged = {} as Record<CategoryId, number>;
    (Object.keys(myShares) as CategoryId[]).forEach((k) => {
      merged[k] = myShares[k] * 0.85 + (tripShares[k] ?? 0) * 0.15;
    });
    return merged;
  }, [myShares, tripShares]);
  const updatedProfile = classifyProfile(updatedShares);

  const overBudget = myShare - state.budgetTotal;
  const topCat = Object.entries(tripShares).sort((a, b) => b[1] - a[1])[0];

  if (state.expenses.length === 0 || !dest) {
    return (
      <Screen>
        <TopBar title="여행 리포트" back="/settle" />
        <Body>
          <Notice tone="info">아직 돌아볼 여행 기록이 없어요.</Notice>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface">
      <TopBar title="여행 리포트" subtitle={`${dest.city} ${state.nights}박 ${state.nights + 1}일`} back="/settle" />
      <Body>
        <div className="relative overflow-hidden rounded-card p-4 text-white shadow-card">
          <Image
            src={dest.image}
            alt={`${dest.city} 대표 사진`}
            fill
            sizes="(max-width: 420px) 100vw, 420px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative">
          <div className="text-[11px] text-white/75">{dest.city} 여행이 끝났어요</div>
          <div className="mt-1 text-[24px] font-bold leading-tight">{krw(myShare)} 썼어요</div>
          <div className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-semibold">
            {overBudget <= 0 ? `예산보다 ${krw(-overBudget)} 덜 썼어요` : `예산보다 ${krw(overBudget)} 더 썼어요`}
          </div>
          <div className="mt-3 flex gap-5 text-[12px]">
            <div>
              <div className="text-white/70">계획한 예산</div>
              <div className="font-bold tabular-nums">{krw(state.budgetTotal)}</div>
            </div>
            <div>
              <div className="text-white/70">실제로 쓴 돈</div>
              <div className="font-bold tabular-nums">{krw(myShare)}</div>
            </div>
            <div>
              <div className="text-white/70">기록</div>
              <div className="font-bold tabular-nums">{state.expenses.length}건</div>
            </div>
          </div>
          </div>
        </div>

        <Card>
          <SectionTitle>여행에서는 어디에 썼나요?</SectionTitle>
          <div className="mt-3">
            <CategoryBar shares={tripShares} limit={6} />
          </div>
          {topCat && (
            <p className="mt-3 border-t border-black/5 pt-3 text-[12px] text-ink-500">
              이번 여행 지출의 {pct(topCat[1])}가 {CATEGORY_MAP[topCat[0] as CategoryId].label}였어요.
            </p>
          )}
        </Card>

        <Card className="border-2 border-brand-500">
          <AiBadge>다시 계산했어요</AiBadge>
          <SectionTitle hint="여행 기록 반영">내 소비 프로파일</SectionTitle>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 rounded-2xl bg-surface p-3 text-center">
              <div className="text-[10.5px] text-ink-500">여행 전</div>
              <div className="mt-1 text-[12px] font-semibold">{myProfile.profile.label}</div>
              <div className="text-[10.5px] text-ink-300">적합도 {pct(myProfile.scores[0].score)}</div>
            </div>
            <span className="text-ink-300">→</span>
            <div className="flex-1 rounded-2xl bg-brand-50 p-3 text-center">
              <div className="text-[10.5px] text-brand-700">여행 후</div>
              <div className="mt-1 text-[12px] font-semibold text-brand-700">{updatedProfile.profile.label}</div>
              <div className="text-[10.5px] text-brand-600">적합도 {pct(updatedProfile.scores[0].score)}</div>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-ink-500">
            여행에서 결제하고 정산한 기록이 소비 성향에 반영됐어요. 여행을 반복할수록 다음 추천이 더 잘 맞아요.
          </p>
        </Card>

        <Card>
          <SectionTitle>다음 여행은 이렇게</SectionTitle>
          <div className="mt-3 flex gap-3">
            <Stat label="적당한 예산" value={krw(Math.round((myShare * 1.05) / 10000) * 10000)} sub="이번 지출 기준" />
            <Stat label="어울리는 여행" value={updatedProfile.profile.label} />
          </div>
          <div className="mt-3 space-y-1.5">
            {PROFILES[updatedProfile.profile.id].travelStyle.map((t) => (
              <div key={t} className="rounded-xl bg-surface px-3 py-2 text-[12px] text-ink-700">
                {t}
              </div>
            ))}
          </div>
        </Card>
      </Body>
      <Footer>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-line flex-1">
            처음부터 다시하기
          </button>
          <Link href="/trip/new" className="btn-primary flex-1">
            다음 여행 만들기
          </Link>
        </div>
      </Footer>
    </Screen>
  );
}
