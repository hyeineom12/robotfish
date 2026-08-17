"use client";

import { useTrip } from "@/components/store";
import { CARD_MAP, CATEGORY_MAP, PROFILES } from "@/lib/catalog";
import { groupBudgetCapacity } from "@/lib/analysis";
import { krwShort, pct } from "@/lib/format";
import {
  AiBadge,
  Avatar,
  Body,
  Card,
  CategoryBar,
  Dot,
  Footer,
  LinkButton,
  Notice,
  Screen,
  SectionTitle,
  Stat,
  TopBar,
} from "@/components/ui";
import type { CategoryId } from "@/lib/types";

/** 그룹 성향 배너 배경 */
const GROUP_PHOTO = "/profiles/group.jpg";

export default function GroupProfilePage() {
  const { state, members, groupProfile, groupSharesValue } = useTrip();
  const p = groupProfile.profile;
  const cap = groupBudgetCapacity(members);

  const allCards = members.flatMap((m) => m.cardIds.map((id) => ({ member: m, card: CARD_MAP[id] })));
  const bestFx = [...allCards].sort((a, b) => a.card.fxFeeRate - b.card.fxFeeRate)[0];
  const lounge = allCards.filter((c) => c.card.loungePass > 0);

  const topCats = Object.entries(groupSharesValue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id as CategoryId);

  const bestByCat = topCats.map((cat) => ({
    cat,
    winner: allCards.find((c) => c.card.bestFor.includes(cat)),
  }));

  return (
    <Screen>
      <TopBar title="우리 그룹 소비 성향" subtitle={`${state.memberIds.length}명의 소비를 함께 봤어요`} back="/trip/group" />
      <Body>
        <Card className="animate-pop relative overflow-hidden text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GROUP_PHOTO} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          {/* 사진 위에서도 흰 글씨가 읽히도록 어둡게 덮는다 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
          <div className="relative">
            <AiBadge>그룹 성향</AiBadge>
            <div className="mt-3">
              <div className="text-[11px] text-white/70">우리는</div>
              <div className="text-[22px] font-bold leading-tight">{p.label}</div>
            </div>
            <div className="mt-3 flex -space-x-2">
              {members.map((m) => (
                <Avatar key={m.id} src={m.photo} name={m.name} size={36} className="border-2 border-white/80" />
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle hint="구성원 평균">그룹 소비 비중</SectionTitle>
          <div className="mt-3">
            <CategoryBar shares={groupSharesValue} />
          </div>
        </Card>

        <Card>
          <SectionTitle>구성원별 성향</SectionTitle>
          <div className="mt-3 space-y-2.5">
            {members.map((m) => {
              const mp = PROFILES[m.profileId];
              return (
                <div key={m.id} className="flex items-center gap-3">
<Avatar src={m.photo} name={m.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">
                      {m.name} {m.isMe && <span className="text-[11px] text-ink-300">(나)</span>}
                    </div>
                    <div className="truncate text-[11.5px]" style={{ color: mp.color }}>
                      {mp.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle hint="해외 결제 기준">우리가 가진 카드</SectionTitle>
          <div className="mt-3 space-y-2">
            {allCards.map(({ member, card }, i) => (
              <div key={`${member.id}-${card.id}-${i}`} className="rounded-2xl bg-surface px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold">{card.name}</div>
                    <div className="text-[11px] text-ink-500">
                      {card.issuer} · {member.name} 보유
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[12px] font-bold tabular-nums ${
                      card.fxFeeRate === 0 ? "text-mint-600" : "text-ink-700"
                    }`}
                  >
                    수수료 {pct(card.fxFeeRate, 1)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {card.perks.slice(0, 2).map((perk) => (
                    <span key={perk} className="chip bg-white text-ink-500">
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <Notice tone="ok">
              해외에서는 {bestFx.member.name}님의 <b>{bestFx.card.name}</b>로 결제하면 수수료를 가장 아낄 수 있어요.
            </Notice>
            {lounge.length > 0 && (
              <Notice tone="info">
                공항 라운지는 {lounge.map((l) => `${l.member.name}님 ${l.card.loungePass}회`).join(", ")} 쓸 수 있어요.
              </Notice>
            )}
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="label">많이 쓰는 카테고리에 좋은 카드</div>
            {bestByCat.map(({ cat, winner }) => (
              <div key={cat} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="flex items-center gap-1.5">
                  <Dot category={cat} />
                  {CATEGORY_MAP[cat].label}
                </span>
                <span className="truncate text-right font-semibold text-brand-700">
                  {winner ? `${winner.card.name} (${winner.member.name})` : "해당 카드 없음"}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 border-t border-black/5 pt-2.5 text-[11px] leading-relaxed text-ink-300">
            카드 혜택은 데모 기준 정보예요. 실제 조건은 카드사 안내를 확인해 주세요.
          </p>
        </Card>

        <Card>
          <SectionTitle hint="가장 여유가 적은 사람 기준">우리 그룹 예산</SectionTitle>
          <div className="mt-3 flex gap-3">
            <Stat label="무리 없는 예산" value={krwShort(cap.safeCap)} sub="1인 기준" />
            <Stat label="최대 예산" value={krwShort(cap.stretchCap)} sub="1인 기준" />
            <Stat label="그룹 합계" value={krwShort(cap.safeCap * members.length)} />
          </div>
        </Card>
      </Body>
      <Footer>
        <LinkButton href="/trip/recommend">예산과 일정 추천받기</LinkButton>
      </Footer>
    </Screen>
  );
}
