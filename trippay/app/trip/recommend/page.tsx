"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTrip } from "@/components/store";
import { breakdownTotal, budgetCapacity, groupBudgetCapacity, rankDestinations } from "@/lib/analysis";
import { MEMBER_MAP } from "@/lib/demo";
import { asset } from "@/lib/asset";
import { krw, krwShort } from "@/lib/format";
import { AiBadge, Body, Card, Footer, MoneyRow, Notice, Screen, SectionTitle, Sentences, TopBar } from "@/components/ui";

export default function Recommend() {
  const router = useRouter();
  const { state, set, members, myShares, groupSharesValue, myProfile, groupProfile } = useTrip();
  const isGroup = state.mode === "group";

  const [thinking, setThinking] = useState(true);
  const [selected, setSelected] = useState<string | null>(state.destinationId);
  const [stretch, setStretch] = useState(false);

  const cap = useMemo(
    () => (isGroup ? groupBudgetCapacity(members) : budgetCapacity(MEMBER_MAP.me)),
    [isGroup, members]
  );
  const budgetCap = stretch ? cap.stretchCap : cap.safeCap;
  const shares = isGroup ? groupSharesValue : myShares;
  const profile = isGroup ? groupProfile.profile : myProfile.profile;

  const ranked = useMemo(
    () => rankDestinations(shares, budgetCap, state.nights, isGroup ? members.length : 1),
    [shares, budgetCap, state.nights, isGroup, members.length]
  );

  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const chosen = ranked.find((r) => r.dest.id === selected) ?? null;

  const confirm = () => {
    if (!chosen) return;
    set({
      destinationId: chosen.dest.id,
      budget: chosen.breakdown,
      budgetTotal: breakdownTotal(chosen.breakdown),
    });
    router.push("/trip/itinerary");
  };

  if (thinking) {
    return (
      <Screen>
        <TopBar title="분석하고 있어요" back={isGroup ? "/trip/group-profile" : "/trip/new"} />
        <Body className="flex items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="animate-pulse text-[14px] font-semibold">소비 성향과 예산을 맞춰보고 있어요</p>
            <p className="text-[12px] text-ink-300">
              {isGroup ? `${members.length}명의 소비 데이터를 종합하는 중` : "최근 6개월 카드 내역을 보는 중"}
            </p>
          </div>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        title="예산과 여행지"
        subtitle={`${state.nights}박 ${state.nights + 1}일 · ${isGroup ? `${members.length}명` : "혼자"}`}
        back={isGroup ? "/trip/group-profile" : "/trip/new"}
      />
      <Body>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <AiBadge>예산 계산</AiBadge>
              <div className="mt-2 text-[11px] text-ink-500">한 사람이 쓸 수 있는 금액</div>
              {/* 그룹 예산은 자릿수가 커서 금액이 줄바꿈되지 않게 붙여 둔다 */}
              <div className="whitespace-nowrap text-[26px] font-bold leading-tight tabular-nums">{krw(budgetCap)}</div>
            </div>
            <div className="flex shrink-0 whitespace-nowrap rounded-full bg-surface p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setStretch(false)}
                className={`rounded-full px-2.5 py-1.5 ${!stretch ? "bg-white text-brand-700 shadow-sm" : "text-ink-500"}`}
              >
                무리 없이
              </button>
              <button
                onClick={() => setStretch(true)}
                className={`rounded-full px-2.5 py-1.5 ${stretch ? "bg-white text-coral-600 shadow-sm" : "text-ink-500"}`}
              >
                최대로
              </button>
            </div>
          </div>
          <Sentences
            text={
              isGroup
                ? "여유가 가장 적은 사람에게 맞췄어요. 비상금은 남겨두고 계산했어요."
                : "비상금은 남겨두고, 한 달에 남는 돈을 더해서 계산했어요."
            }
            className="mt-2 text-[11.5px] leading-relaxed text-ink-500"
          />
          <div className="mt-3 space-y-1 rounded-2xl bg-surface p-3">
            <div className="label">더 모으면 얼마까지?</div>
            {cap.savingMonths.map((s) => (
              <div key={s.months} className="flex justify-between text-[12px]">
                <span className="text-ink-500">{s.months}개월 더 모으면</span>
                <span className="font-semibold tabular-nums">{krwShort(s.budget)}</span>
              </div>
            ))}
          </div>
        </Card>

        <SectionTitle hint={`${profile.label} 기준`}>추천 여행지</SectionTitle>
        <div className="space-y-2.5">
          {ranked.map((r) => (
            <button key={r.dest.id} onClick={() => setSelected(r.dest.id)} className="w-full text-left">
              <Card
                className={`transition ${
                  selected === r.dest.id ? "border-2 border-brand-500" : "border-2 border-transparent hover:bg-surface"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    <Image
                      src={asset(r.dest.image)}
                      alt={`${r.dest.city} 대표 사진`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold">{r.dest.city}</span>
                      <span className="text-[11px] text-ink-300">{r.dest.country}</span>
                      {!r.within && <span className="chip bg-red-50 text-red-500">예산 초과</span>}
                    </div>
                    <Sentences
                      text={r.dest.blurb}
                      className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[12px] text-ink-500">
                        1인 <b className="tabular-nums text-ink-900">{krw(r.cost)}</b>
                      </span>
                      <span className="chip bg-brand-50 text-brand-700">잘 맞아요 {r.score}점</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {chosen && (
          <Card className="animate-slideup">
            <SectionTitle hint="1인 기준">{chosen.dest.city} 예산 나누기</SectionTitle>
            <div className="mt-2 divide-y divide-black/5">
              <MoneyRow label="항공" value={chosen.breakdown.flight} />
              <MoneyRow label={`숙박 ${state.nights}박`} value={chosen.breakdown.stay} />
              <MoneyRow label="식비" value={chosen.breakdown.food} />
              <MoneyRow label="액티비티" value={chosen.breakdown.activity} />
              <MoneyRow label="쇼핑" value={chosen.breakdown.shopping} />
              <MoneyRow label="예비비" value={chosen.breakdown.buffer} />
              <MoneyRow label="합계" value={chosen.cost} strong />
            </div>
            {chosen.within ? (
              <Notice tone="ok">예산보다 {krw(budgetCap - chosen.cost)} 여유가 있어요.</Notice>
            ) : (
              <Notice tone="warn">
                <Sentences
                  text={`예산보다 ${krw(chosen.cost - budgetCap)} 더 필요해요. 기간을 줄이거나 ${cap.savingMonths[1].months}개월 뒤에 떠나는 건 어때요?`}
                />
              </Notice>
            )}
          </Card>
        )}
      </Body>
      <Footer>
        <button onClick={confirm} disabled={!chosen} className="btn-primary w-full">
          {chosen ? `${chosen.dest.city} 일정 만들기` : "여행지를 선택해 주세요"}
        </button>
      </Footer>
    </Screen>
  );
}
