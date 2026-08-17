"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/components/store";
import { CARD_MAP, CATEGORIES, CATEGORY_MAP, DESTINATION_MAP } from "@/lib/catalog";
import { fxCompare, rouletteWeights, spinRoulette, toKrw } from "@/lib/analysis";
import { MEMBER_MAP } from "@/lib/demo";
import { krw, pct } from "@/lib/format";
import { Avatar, Body, Card, Dot, Footer, Notice, Screen, SectionTitle, Sentences, TopBar } from "@/components/ui";
import type { CategoryId, Expense } from "@/lib/types";

const PRESETS: { merchant: string; category: CategoryId }[] = [
  { merchant: "현지 식당", category: "food" },
  { merchant: "카페", category: "cafe" },
  { merchant: "택시", category: "transport" },
  { merchant: "기념품", category: "shopping" },
];

export default function ExpenseInput() {
  const router = useRouter();
  const { state, set, members } = useTrip();
  const dest = state.destinationId ? DESTINATION_MAP[state.destinationId] : null;

  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [local, setLocal] = useState("");
  const [participants, setParticipants] = useState<string[]>(state.memberIds);
  const [payerId, setPayerId] = useState<string>("me");
  const [spinning, setSpinning] = useState(false);
  const [treatId, setTreatId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const isGroup = state.mode === "group" && members.length > 1;
  const localAmount = Number(local.replace(/[^0-9.]/g, "")) || 0;
  const krwAmount = dest ? toKrw(localAmount, dest.fxRate) : 0;

  const weights = useMemo(() => rouletteWeights(state.expenses, state.memberIds), [state.expenses, state.memberIds]);

  const payerCard = CARD_MAP[MEMBER_MAP[payerId]?.cardIds[0] ?? "card_toss"];
  const cmp = dest ? fxCompare(localAmount, dest, payerCard.fxFeeRate) : null;

  const bonusCard = useMemo(() => {
    if (!treatId) return null;
    const m = MEMBER_MAP[treatId];
    const card = m?.cardIds.map((id) => CARD_MAP[id]).find((c) => c.bestFor.includes(category));
    return card ? { m, card } : null;
  }, [treatId, category]);

  if (!dest) {
    return (
      <Screen>
        <TopBar title="지출 기록" back="/live" />
        <Body>
          <Notice tone="warn">여행 정보가 없어요.</Notice>
        </Body>
      </Screen>
    );
  }

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setTreatId(null);
    const ids = weights.map((w) => w.id);
    let i = 0;
    const timer = setInterval(() => {
      setHighlight(ids[i % ids.length]);
      i++;
    }, 90);
    setTimeout(() => {
      clearInterval(timer);
      const winner = spinRoulette(weights);
      setHighlight(winner);
      setTreatId(winner);
      setPayerId(winner);
      setSpinning(false);
    }, 1900);
  };

  const cancelTreat = () => {
    setTreatId(null);
    setHighlight(null);
    setPayerId("me");
  };

  const save = () => {
    if (!localAmount || !merchant) return;
    const e: Expense = {
      id: `e${Date.now()}`,
      createdAt: Date.now(),
      merchant,
      category,
      localAmount,
      currency: dest.currency,
      krwAmount,
      payerId,
      // 쏘기면 당첨자가 전액 부담해서 나눌 사람이 없어요
      participantIds: treatId ? [treatId] : participants,
      isTreat: !!treatId,
    };
    set({ expenses: [...state.expenses, e] });
    router.push("/live");
  };

  const toggleParticipant = (id: string) => {
    setParticipants((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <Screen>
      <TopBar title="지출 기록하기" subtitle={`${dest.city} · ${dest.currency}`} back="/live" />
      <Body>
        <Card>
          <div className="label mb-1.5">얼마를 썼나요?</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-ink-300">{dest.currencySymbol}</span>
            <input
              inputMode="decimal"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-[32px] font-bold tabular-nums outline-none placeholder:text-ink-300/50"
            />
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-black/5 pt-2">
            <span className="text-[12px] text-ink-500">원화로 바꾸면</span>
            <span className="text-[16px] font-bold tabular-nums text-brand-700">{krw(krwAmount)}</span>
          </div>
          <div className="mt-1 text-[10.5px] text-ink-300">
            1 {dest.currency} = {dest.fxRate.toLocaleString("ko-KR")}원 기준
          </div>
        </Card>

        <Card>
          <div className="label mb-2">어디에서 썼나요?</div>
          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="가맹점 이름을 입력해 주세요"
            className="w-full rounded-xl bg-surface px-3 py-2.5 text-[14px] outline-none placeholder:text-[13px] placeholder:text-ink-300"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.merchant}
                onClick={() => {
                  setMerchant(p.merchant);
                  setCategory(p.category);
                }}
                className="chip bg-surface text-ink-700 hover:bg-brand-50"
              >
                <Dot category={p.category} size={6} />
                {p.merchant}
              </button>
            ))}
          </div>

          <div className="label mb-2 mt-4">카테고리</div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => c.id !== "etc").map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`chip transition ${category === c.id ? "bg-brand-600 text-white" : "bg-surface text-ink-700"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Card>

        {cmp && localAmount > 0 && (
          <Card>
            <SectionTitle hint="이 금액 기준">카드가 나을까, 현금이 나을까</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className={`rounded-2xl p-3 ${cmp.better === "card" ? "bg-mint-400/12 ring-2 ring-mint-500" : "bg-surface"}`}>
                <div className="truncate text-[11px] text-ink-500">{payerCard.name}</div>
                <div className="text-[10.5px] text-ink-300">수수료 {pct(payerCard.fxFeeRate, 1)}</div>
                <div className="mt-0.5 text-[15px] font-bold tabular-nums">{krw(cmp.cardCost)}</div>
              </div>
              <div className={`rounded-2xl p-3 ${cmp.better === "cash" ? "bg-mint-400/12 ring-2 ring-mint-500" : "bg-surface"}`}>
                <div className="text-[11px] text-ink-500">현금 환전</div>
                <div className="text-[10.5px] text-ink-300">수수료 1.75%</div>
                <div className="mt-0.5 text-[15px] font-bold tabular-nums">{krw(cmp.cashCost)}</div>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] text-mint-600">
              {cmp.better === "card" ? "카드로 결제하면" : "현금으로 결제하면"} {krw(cmp.diff)} 아낄 수 있어요.
            </p>
          </Card>
        )}

        {isGroup && (
          <>
            <Card className="bg-gradient-to-br from-amber-400 to-orange-400 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-bold">결제 룰렛</div>
                  <p className="text-[11.5px] text-white/85">당첨된 사람이 전액 쏘기로 해요</p>
                </div>
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="btn shrink-0 bg-white px-4 py-2.5 text-[13px] text-orange-600 disabled:opacity-70"
                >
                  {spinning ? "돌리는 중" : "돌리기"}
                </button>
              </div>

              <div className={`mt-3 grid gap-2 ${weights.length >= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
                {weights.map((w) => {
                  const m = MEMBER_MAP[w.id];
                  if (!m) return null;
                  const on = highlight === w.id;
                  return (
                    <div
                      key={w.id}
                      className={`rounded-2xl px-1 py-2.5 text-center transition ${
                        on ? "scale-105 bg-white text-orange-600 shadow-lg" : "bg-white/15 text-white"
                      }`}
                    >
                      <div className="flex justify-center">
                        <Avatar src={m.photo} name={m.name} size={34} />
                      </div>
                      <div className="mt-1 text-[11px] font-semibold">{m.name}</div>
                      <div className="text-[9.5px] opacity-80">{pct(w.prob)}</div>
                    </div>
                  );
                })}
              </div>

              <Sentences
                text="지금까지 낸 돈이 적을수록 당첨 확률이 올라가요. 재미는 그대로, 부담은 공평하게 나눠요."
                className="mt-2 text-[10.5px] leading-relaxed text-white/80"
              />

              {treatId && (
                <div className="mt-3 animate-pop rounded-2xl bg-white p-3 text-ink-900">
                  <div className="text-[14px] font-bold">{MEMBER_MAP[treatId].name}님이 쏘기로 했어요</div>
                  <p className="mt-1 text-[11.5px] text-ink-500">
                    이 결제는 나누지 않아요. {MEMBER_MAP[treatId].name}님이 {krw(krwAmount)} 전액을 부담해요.
                  </p>
                  {bonusCard && (
                    <p className="mt-1.5 text-[11.5px] text-mint-600">
                      마침 {bonusCard.card.name}가 {CATEGORY_MAP[category].label}에 혜택이 있어요
                    </p>
                  )}
                  <button onClick={cancelTreat} className="btn-line mt-2.5 w-full py-2 text-[12.5px]">
                    취소하고 나눠서 내기
                  </button>
                </div>
              )}
            </Card>

            {!treatId && (
              <>
                <Card>
                  <SectionTitle hint={`${participants.length}명`}>나눠 낼 사람</SectionTitle>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.map((m) => {
                      const on = participants.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggleParticipant(m.id)}
                          className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12.5px] font-semibold transition ${
                            on ? "bg-brand-600 text-white" : "bg-surface text-ink-500"
                          }`}
                        >
                          <Avatar src={m.photo} name={m.name} size={24} />
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                  {participants.length > 0 && krwAmount > 0 && (
                    <p className="mt-2.5 text-[12px] text-ink-500">
                      한 사람당 <b className="text-ink-900">{krw(krwAmount / participants.length)}</b>
                    </p>
                  )}
                </Card>

                <Card>
                  <SectionTitle>누가 결제했나요?</SectionTitle>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayerId(m.id)}
                        className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12.5px] font-semibold transition ${
                          payerId === m.id ? "bg-ink-900 text-white" : "bg-surface text-ink-500"
                        }`}
                      >
                        <Avatar src={m.photo} name={m.name} size={24} />
                        {m.name}
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </Body>
      <Footer>
        <button onClick={save} disabled={!localAmount || !merchant} className="btn-primary w-full">
          {localAmount && merchant ? `${krw(krwAmount)} 기록하기` : "금액과 가맹점을 입력해 주세요"}
        </button>
      </Footer>
    </Screen>
  );
}
