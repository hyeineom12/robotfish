"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTrip } from "@/components/store";
import { CATEGORIES, DESTINATION_MAP, CATEGORY_MAP } from "@/lib/catalog";
import { buildItinerary } from "@/lib/itinerary";
import { asset } from "@/lib/asset";
import { krw, dateFull, dateLabel, weekdayLong } from "@/lib/format";
import { RouteMap } from "@/components/RouteMap";
import { AiBadge, Body, Card, Dot, Footer, Notice, Screen, SectionTitle, Sentences, TopBar } from "@/components/ui";
import type { CategoryId, ItineraryDay, ItineraryItem } from "@/lib/types";

/** 화면에서 항목을 가리키는 키. b=원래 일정, a=사용자가 추가한 일정 */
type PlanItem = ItineraryItem & { key: string };

export default function ItineraryPage() {
  const router = useRouter();
  const { state, set, members } = useTrip();
  const [generating, setGenerating] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [editing, setEditing] = useState(false);
  const [mapView, setMapView] = useState(false);
  /** 사용자가 뺀 일정. 비용 합계에서도 빠진다 */
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  /** 사용자가 직접 넣은 일정 (일차별) */
  const [addedByDay, setAddedByDay] = useState<Record<number, PlanItem[]>>({});
  const [draft, setDraft] = useState({ time: "12:00", title: "", place: "", category: "food" as CategoryId, cost: "" });

  const toggleItem = (key: string) =>
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const deleteAdded = (dayNo: number, key: string) =>
    setAddedByDay((prev) => ({ ...prev, [dayNo]: (prev[dayNo] ?? []).filter((it) => it.key !== key) }));

  const addItem = (dayNo: number) => {
    const item: PlanItem = {
      key: `a${dayNo}-${Date.now()}`,
      time: draft.time,
      title: draft.title.trim(),
      place: draft.place.trim() || dest?.city || "",
      category: draft.category,
      estCost: Number(draft.cost.replace(/[^0-9]/g, "")) || 0,
    };
    setAddedByDay((prev) => ({ ...prev, [dayNo]: [...(prev[dayNo] ?? []), item] }));
    setDraft({ time: "12:00", title: "", place: "", category: "food", cost: "" });
  };

  const dest = state.destinationId ? DESTINATION_MAP[state.destinationId] : null;

  const days = useMemo(
    () => (dest ? buildItinerary(dest, state.nights, state.startDate) : []),
    [dest, state.nights, state.startDate]
  );

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!dest) {
    return (
      <Screen>
        <TopBar title="일정" back="/trip/recommend" />
        <Body>
          <Notice tone="warn">여행지를 먼저 선택해 주세요.</Notice>
        </Body>
      </Screen>
    );
  }

  if (generating) {
    return (
      <Screen>
        <TopBar title="일정을 만들고 있어요" back="/trip/recommend" />
        <Body className="flex items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="animate-pulse text-[14px] font-semibold">
              {dest.city} {state.nights}박 {state.nights + 1}일 코스를 불러오고 있어요
            </p>
            <p className="text-[12px] text-ink-300">한국인 리뷰를 함께 보는 중</p>
          </div>
        </Body>
      </Screen>
    );
  }

  const day = days.find((d) => d.day === activeDay) ?? days[0];
  /** 원래 일정 + 추가한 일정을 시간순으로 합친 하루 */
  const planOf = (d: ItineraryDay): PlanItem[] =>
    [...d.items.map((it, idx) => ({ ...it, key: `b${d.day}-${idx}` })), ...(addedByDay[d.day] ?? [])].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  const kept = (d: ItineraryDay) => planOf(d).filter((it) => !removed.has(it.key));

  /** 지도에는 빼고 더한 결과를 그대로 보여준다 */
  const editedDays = days.map((d) => ({ ...d, items: kept(d) }));
  const dayPlan = planOf(day);
  const visibleItems = kept(day);
  const dayCost = visibleItems.reduce((s, i) => s + i.estCost, 0);
  const totalPlanned = days.reduce((s, d) => s + kept(d).reduce((x, i) => x + i.estCost, 0), 0);

  const start = () => {
    set({ confirmed: true });
    router.push("/live");
  };

  return (
    <Screen>
      <TopBar
        title={`${dest.city} ${state.nights}박 ${state.nights + 1}일`}
        subtitle={`${dateLabel(state.startDate)} 출발 · ${state.mode === "group" ? `${members.length}명` : "혼자"}`}
        back="/trip/recommend"
      />
      <Body>
        <div className="relative overflow-hidden rounded-card shadow-card">
          <Image
            src={asset(dest.image)}
            alt={`${dest.city} 대표 사진`}
            fill
            sizes="(max-width: 420px) 100vw, 420px"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          <div className="relative p-4 text-white">
            <span className="chip bg-white/20 text-white backdrop-blur-sm">맞춤 일정</span>
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold leading-tight">{dest.city}</span>
                <span className="text-[13px] text-white/70">{dest.country}</span>
              </div>
              <div className="text-[11.5px] text-white/85">{state.nights}박 {state.nights + 1}일 대표 코스</div>
            </div>
            <div className="mt-3 flex gap-5 text-[12px]">
              <div>
                <div className="text-white/70">일정 예상 비용</div>
                <div className="font-bold tabular-nums">{krw(totalPlanned)}</div>
              </div>
              <div>
                <div className="text-white/70">전체 예산</div>
                <div className="font-bold tabular-nums">{krw(state.budgetTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition ${
                activeDay === d.day ? "bg-brand-600 text-white" : "bg-white text-ink-500"
              }`}
            >
              {d.day}일차
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-0.5">
          <div>
            <div className="text-[14px] font-bold">{dateFull(day.date)}</div>
            <div className="text-[11.5px] text-ink-300">{weekdayLong(day.date)}</div>
          </div>
          <span className="chip bg-surface text-ink-700">1인 {krw(dayCost)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setEditing((v) => !v);
              setMapView(false);
            }}
            className={editing ? "btn-primary py-2.5 text-[13px]" : "btn-line py-2.5 text-[13px]"}
          >
            {editing ? "수정 끝내기" : "일정 수정"}
          </button>
          <button
            onClick={() => {
              setMapView((v) => !v);
              setEditing(false);
            }}
            className={mapView ? "btn-primary py-2.5 text-[13px]" : "btn-line py-2.5 text-[13px]"}
          >
            {mapView ? "목록으로 보기" : "지도로 보기"}
          </button>
        </div>

        {mapView ? (
          <Card>
            <SectionTitle hint="일차별 색으로 구분">동선 지도</SectionTitle>
            <div className="mt-3">
              <RouteMap days={editedDays} activeDay={activeDay} onSelectDay={setActiveDay} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-300">
              주소를 옮긴 좌표로 그린 지도라 거리와 방향은 맞지만 도로·지형은 나오지 않아요.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {dayPlan.map((it, idx) => {
              const dropped = removed.has(it.key);
              if (dropped && !editing) return null;
              const isMine = it.key.startsWith("a");
              return (
                <div key={it.key} className="flex gap-3">
                  <div className="flex w-11 shrink-0 flex-col items-center pt-1">
                    <span className="text-[11px] font-bold tabular-nums text-brand-600">{it.time}</span>
                    {idx < dayPlan.length - 1 && <div className="mt-1.5 w-px flex-1 bg-ink-300/40" />}
                  </div>
                  <Card className={`flex-1 ${dropped ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`break-keep text-[14px] font-bold ${dropped ? "line-through" : ""}`}>
                          {it.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
                          <Dot category={it.category} size={6} />
                          <span className="truncate">{it.place}</span>
                          {isMine && <span className="chip shrink-0 bg-brand-50 text-brand-700">직접 추가</span>}
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums">
                        {it.estCost ? krw(it.estCost) : "무료"}
                      </span>
                    </div>
                    {!dropped && it.koreanReview && (
                      <div className="mt-2 rounded-xl bg-surface px-2.5 py-2 text-[11px] leading-relaxed text-ink-700">
                        {it.koreanReview}
                      </div>
                    )}
                    {!dropped && it.note && <div className="mt-1.5 text-[11px] text-brand-700">{it.note}</div>}
                    {editing && (
                      <button
                        onClick={() => (isMine ? deleteAdded(day.day, it.key) : toggleItem(it.key))}
                        className="btn-line mt-2.5 w-full py-1.5 text-[12px]"
                      >
                        {isMine ? "삭제" : dropped ? "일정에 되돌리기" : "이 일정 빼기"}
                      </button>
                    )}
                  </Card>
                </div>
              );
            })}

            {editing && (
              <Card className="animate-slideup border-2 border-dashed border-brand-500/40">
                <SectionTitle hint={`${day.day}일차`}>일정 추가</SectionTitle>
                <div className="mt-3 space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={draft.time}
                      onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                      aria-label="시간"
                      className="w-[136px] shrink-0 rounded-xl bg-surface px-2.5 py-2.5 text-[13px] tabular-nums outline-none"
                    />
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="무엇을 하나요?"
                      aria-label="일정 이름"
                      className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={draft.place}
                      onChange={(e) => setDraft({ ...draft, place: e.target.value })}
                      placeholder="장소"
                      aria-label="장소"
                      className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-300"
                    />
                    <input
                      inputMode="numeric"
                      value={draft.cost}
                      onChange={(e) => setDraft({ ...draft, cost: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="예상 금액"
                      aria-label="예상 금액"
                      className="w-[110px] shrink-0 rounded-xl bg-surface px-3 py-2.5 text-[13px] tabular-nums outline-none placeholder:text-ink-300"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setDraft({ ...draft, category: c.id })}
                        className={`chip border ${
                          draft.category === c.id
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-ink-300/40 bg-white text-ink-500"
                        }`}
                      >
                        <Dot category={c.id} size={6} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => addItem(day.day)}
                    disabled={!draft.title.trim()}
                    className="btn-primary w-full py-2.5 text-[13px]"
                  >
                    {draft.title.trim() ? `${draft.time}에 추가하기` : "일정 이름을 입력해 주세요"}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        <Notice tone="info">
          <Sentences text="일정은 확정한 뒤에도 바꿀 수 있어요. 여행 중에 예산을 넘기면 남은 일정 금액을 다시 나눠드려요." />
        </Notice>
      </Body>
      <Footer>
        <button onClick={start} className="btn-primary w-full">
          일정 확정하고 여행 시작하기
        </button>
      </Footer>
    </Screen>
  );
}
