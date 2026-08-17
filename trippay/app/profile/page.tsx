"use client";

import { useMemo } from "react";
import { useTrip } from "@/components/store";
import { budgetCapacity, categorySums } from "@/lib/analysis";
import { MEMBER_MAP } from "@/lib/demo";
import { CATEGORY_MAP } from "@/lib/catalog";
import { krw, krwShort, pct } from "@/lib/format";
import {
  AiBadge,
  Body,
  Card,
  CategoryBar,
  Footer,
  LinkButton,
  Notice,
  Screen,
  SectionTitle,
  Sentences,
  Stat,
  TopBar,
} from "@/components/ui";
import type { CategoryId } from "@/lib/types";

export default function ProfilePage() {
  const { myTransactions, myShares, myProfile } = useTrip();
  const me = MEMBER_MAP.me;
  const p = myProfile.profile;
  const cap = budgetCapacity(me);

  const monthly = useMemo(() => {
    const byMonth: Record<string, number> = {};
    myTransactions.forEach((t) => {
      const m = t.date.slice(0, 7);
      byMonth[m] = (byMonth[m] ?? 0) + t.amount;
    });
    return Object.entries(byMonth).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [myTransactions]);

  const sums = categorySums(myTransactions);
  const topCat = Object.entries(myShares).sort((a, b) => b[1] - a[1])[0][0] as CategoryId;

  const maxMonth = Math.max(...monthly.map(([, v]) => v), 1);

  return (
    <Screen>
      <TopBar title="내 소비 프로파일" subtitle={`최근 6개월 ${myTransactions.length}건을 분석했어요`} back="/connect" />
      <Body>
        <Card
          className={`animate-pop relative overflow-hidden text-white ${
            p.image ? "" : "bg-gradient-to-br from-brand-600 to-brand-400"
          }`}
        >
          {p.image && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
              {/* 사진 위에서도 흰 글씨가 읽히도록 어둡게 덮는다 */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/45" />
            </>
          )}
          <div className="relative">
            <AiBadge>내 소비 패턴은?</AiBadge>
            <div className="mt-3">
              <div className="text-[11px] text-white/70">{me.name}님은</div>
              <div className="text-[24px] font-bold leading-tight">{p.label}</div>
            </div>
            <Sentences text={p.description} className="mt-3 text-[12.5px] leading-relaxed text-white/85" />
          </div>
        </Card>

        <Card>
          <SectionTitle hint="상위 5개">카테고리별 지출 비중</SectionTitle>
          <div className="mt-3">
            <CategoryBar shares={myShares} />
          </div>
          <Sentences
            text={`가장 많이 쓴 곳은 ${CATEGORY_MAP[topCat].label}이에요. 6개월 동안 ${krw(sums[topCat])}을 썼어요.`}
            className="mt-3 border-t border-black/5 pt-3 text-[11.5px] text-ink-500"
          />
        </Card>

        <Card>
          <SectionTitle>내 소비 적합도</SectionTitle>
          <div className="mt-3 space-y-2">
            {myProfile.scores.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className={`w-[92px] shrink-0 text-[12px] ${i === 0 ? "font-bold" : "text-ink-500"}`}>
                  {s.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className={`h-full rounded-full ${i === 0 ? "bg-brand-600" : "bg-ink-300/50"}`}
                    style={{ width: `${s.score * 100}%` }}
                  />
                </div>
                <span className="w-9 text-right text-[12px] tabular-nums">{pct(s.score)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle hint="월별">지출 추이</SectionTitle>
          <div className="mt-4 flex h-24 items-end gap-2">
            {monthly.map(([m, v]) => (
              <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold tabular-nums text-ink-500">{krwShort(v)}</span>
                <div className="w-full rounded-t-md bg-brand-500/80" style={{ height: `${(v / maxMonth) * 60}px` }} />
                <span className="text-[10px] text-ink-300">{Number(m.slice(5))}월</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>여행에 쓸 수 있는 돈</SectionTitle>
          <div className="mt-3 flex gap-3">
            <Stat label="한 달에 남는 돈" value={krwShort(cap.monthlySurplus)} />
            <Stat label="무리 없는 예산" value={krwShort(cap.safeCap)} />
            <Stat label="최대 예산" value={krwShort(cap.stretchCap)} />
          </div>
          <div className="mt-3 space-y-1.5 rounded-2xl bg-surface p-3">
            <div className="label">더 모으면 얼마까지?</div>
            {cap.savingMonths.map((s) => (
              <div key={s.months} className="flex justify-between text-[12.5px]">
                <span className="text-ink-500">{s.months}개월 뒤에 떠나면</span>
                <span className="font-semibold tabular-nums">{krw(s.budget)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Notice tone="info">
          여행이 끝나면 정산 데이터로 이 프로파일을 다시 계산해요. 여행을 반복할수록 추천이 정확해져요.
        </Notice>
      </Body>
      <Footer>
        <LinkButton href="/trip/new">여행 만들기</LinkButton>
      </Footer>
    </Screen>
  );
}
