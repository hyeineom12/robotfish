"use client";

import { krw } from "@/lib/format";
import type { ItineraryDay, ItineraryItem } from "@/lib/types";

/** 일차별 색. 지도와 범례가 같은 색을 쓴다 */
export const DAY_COLORS = ["#2f45e0", "#f9584a", "#12b98c", "#f59e0b", "#7a5af5", "#e0498f", "#0ea5e9"];
export const dayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length];

const W = 320;
const H = 300;
const PAD = 30;

type Located = ItineraryItem & { lat: number; lng: number };

/**
 * 지도에 찍는 건 "머무는 곳"만이다.
 * 공항 이동 같은 교통 구간은 수십 km 떨어져 있어 같이 그리면 도심 동선이 한 점으로 뭉갠다.
 */
const isLocated = (it: ItineraryItem): it is Located =>
  typeof it.lat === "number" && typeof it.lng === "number" && it.category !== "transport";

/**
 * 좌표를 뷰박스 안에 맞추는 투영.
 * 위도에 따라 경도 1도의 실제 거리가 줄어드는 것만 보정한 등장방형 투영이라
 * 도시 한 곳을 그리는 정도에서는 모양이 크게 어긋나지 않는다.
 */
function project(points: Located[]) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);

  const xs = lngs.map((v) => v * kx);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...lats);
  const maxY = Math.max(...lats);

  // 한 점뿐이거나 일직선이어도 0으로 나누지 않도록 최소 폭을 준다
  const spanX = Math.max(maxX - minX, 1e-4);
  const spanY = Math.max(maxY - minY, 1e-4);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;

  return (p: { lat: number; lng: number }) => ({
    x: offX + (p.lng * kx - minX) * scale,
    // 위도는 위쪽이 커서 y를 뒤집는다
    y: offY + (maxY - p.lat) * scale,
  });
}

/** km 단위 대략적인 거리 (스케일바용) */
const spanKm = (points: Located[]) => {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const dx = (Math.max(...lngs) - Math.min(...lngs)) * 111 * Math.cos((midLat * Math.PI) / 180);
  const dy = (Math.max(...lats) - Math.min(...lats)) * 111;
  return Math.max(dx, dy);
};

/**
 * 전체 일정의 동선 지도. 일차마다 다른 색 선으로 그리고, 고른 일차만 진하게 보여준다.
 * 지도 타일 없이 좌표만으로 그리기 때문에 거리와 방향은 맞지만 도로·지형은 나오지 않는다.
 */
export function RouteMap({
  days,
  activeDay,
  onSelectDay,
}: {
  days: ItineraryDay[];
  activeDay: number;
  onSelectDay: (day: number) => void;
}) {
  const located = days.map((d) => ({ day: d.day, items: d.items.filter(isLocated) }));
  const all = located.flatMap((d) => d.items);

  if (all.length === 0) {
    return <p className="py-6 text-center text-[12px] text-ink-300">이 일정에는 지도에 표시할 장소가 없어요.</p>;
  }

  const active = located.find((d) => d.day === activeDay);
  // 하루마다 이동 범위가 크게 달라서(도심 반나절 vs 근교 당일치기) 고른 일차에 맞춰 축척을 잡는다
  const frame = active && active.items.length > 1 ? active.items : all;
  const to = project(frame);
  const km = spanKm(frame);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {days.map((d) => {
          const on = d.day === activeDay;
          return (
            <button
              key={d.day}
              onClick={() => onSelectDay(d.day)}
              className={`chip border transition ${on ? "text-white" : "bg-white text-ink-500"}`}
              style={on ? { background: dayColor(d.day), borderColor: dayColor(d.day) } : { borderColor: `${dayColor(d.day)}66` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: on ? "#fff" : dayColor(d.day) }} />
              {d.day}일차
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="일차별 동선 지도">
          {/* 거리 감각을 주는 옅은 격자 */}
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0 L0 0 0 32" fill="none" stroke="#dfe3ec" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />
          {/* 다른 일차 선이 틀 밖으로 나가도 카드 밖으로 삐져나오지 않게 자른다 */}
          <clipPath id="frame">
            <rect width={W} height={H} />
          </clipPath>
          <g clipPath="url(#frame)">

          {/* 고르지 않은 일차는 흐리게 깔아 전체 동선을 함께 보여준다 */}
          {located.map(({ day, items }) => {
            if (items.length < 2 || day === activeDay) return null;
            const d = items.map(to).map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
            return <path key={`bg-${day}`} d={d} fill="none" stroke={dayColor(day)} strokeWidth={2} opacity={0.25} strokeLinejoin="round" />;
          })}
          {located.map(({ day, items }) =>
            day === activeDay
              ? null
              : items.map((it, i) => {
                  const p = to(it);
                  return <circle key={`bgp-${day}-${i}`} cx={p.x} cy={p.y} r={3.5} fill={dayColor(day)} opacity={0.3} />;
                })
          )}

          {/* 고른 일차 */}
          {active && active.items.length > 1 && (
            <path
              d={active.items.map(to).map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ")}
              fill="none"
              stroke={dayColor(active.day)}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {active?.items.map((it, i) => {
            const p = to(it);
            return (
              <g key={`pt-${i}`}>
                <circle cx={p.x} cy={p.y} r={12} fill={dayColor(active.day)} stroke="#fff" strokeWidth={2} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>
                  {i + 1}
                </text>
              </g>
            );
          })}
          </g>

          {/* 스케일 감각용 안내 */}
          <text x={PAD - 18} y={H - 8} fill="#a6acba" fontSize={10}>
            {activeDay}일차 이동 범위 약 {km < 10 ? km.toFixed(1) : Math.round(km)}km
          </text>
        </svg>
      </div>

      <ol className="space-y-2">
        {active?.items.map((it, i) => (
          <li key={`legend-${i}`} className="flex items-center gap-2.5">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: dayColor(active.day) }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold">{it.title}</span>
              <span className="block truncate text-[11px] text-ink-500">
                {it.time} · {it.place}
              </span>
            </span>
            <span className="shrink-0 text-[11.5px] font-semibold tabular-nums">
              {it.estCost ? krw(it.estCost) : "무료"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
