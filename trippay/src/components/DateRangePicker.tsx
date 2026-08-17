"use client";

import { useState } from "react";
import { addDays, diffDays, monthGrid, monthKey, shiftMonth, todayIso } from "@/lib/date";
import { dateFull, weekdayLong } from "@/lib/format";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
/** 달력에서 앞으로 볼 수 있는 개월 수 */
const MONTHS_AHEAD = 12;
/** 한 번에 잡을 수 있는 최대 숙박일 */
const MAX_NIGHTS = 14;

const monthOf = (iso: string) => ({
  year: Number(iso.slice(0, 4)),
  month: Number(iso.slice(5, 7)) - 1,
});

interface Props {
  startDate: string;
  nights: number;
  onChange: (startDate: string, nights: number) => void;
}

/**
 * 아고다식 날짜 범위 선택.
 * 필드를 누르면 달력이 펼쳐지고, 첫 탭이 가는 날, 다음 탭이 오는 날이 된다.
 * 기간(N박)은 두 날짜의 차이로 정해지므로 따로 고르지 않는다.
 */
export function DateRangePicker({ startDate, nights, onChange }: Props) {
  const endDate = addDays(startDate, nights);
  /** null이면 닫힘. 열려 있으면 "지금 무슨 날짜를 기다리는지"를 담는다 */
  const [picking, setPicking] = useState<{ from: string | null } | null>(null);

  const openFor = (field: "start" | "end") =>
    // 가는 날을 누르면 범위를 처음부터, 오는 날을 누르면 가는 날은 두고 다시 고른다
    setPicking({ from: field === "end" ? startDate : null });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink-300/40 bg-white">
        <FieldButton
          label="가는 날"
          iso={picking?.from ?? startDate}
          active={picking?.from === null}
          onClick={() => openFor("start")}
        />
        {/* 가는 날만 고른 중이면 오는 날은 아직 없는 상태로 비워 둔다 */}
        <FieldButton
          label="오는 날"
          iso={picking?.from ? null : endDate}
          active={!!picking?.from}
          onClick={() => openFor("end")}
          className="border-l border-ink-300/40"
        />
      </div>

      {picking && (
        <CalendarPanel
          from={picking.from}
          startDate={startDate}
          endDate={endDate}
          nights={nights}
          onPick={(iso) => {
            if (picking.from === null || iso <= picking.from) {
              setPicking({ from: iso });
              return;
            }
            onChange(picking.from, diffDays(picking.from, iso));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}

/**
 * 달력 본체. 열렸을 때만 마운트한다 —
 * "오늘"이 서버 렌더와 어긋나서 하이드레이션이 깨지는 걸 막는다.
 */
function CalendarPanel({
  from,
  startDate,
  endDate,
  nights,
  onPick,
  onClose,
}: {
  from: string | null;
  startDate: string;
  endDate: string;
  nights: number;
  onPick: (iso: string) => void;
  onClose: () => void;
}) {
  const today = todayIso();
  const [cursor, setCursor] = useState(() => monthOf(from ?? startDate));

  const thisMonth = monthOf(today);
  const minKey = monthKey(thisMonth.year, thisMonth.month);
  const curKey = monthKey(cursor.year, cursor.month);

  // 오는 날을 고르는 중이면 가는 날 하나만, 아니면 확정된 범위를 칠한다
  const rangeStart = from ?? startDate;
  const rangeEnd = from ? null : endDate;
  const limit = from ? addDays(from, MAX_NIGHTS) : null;

  return (
    <div className="animate-slideup card p-3">
      <div className="flex items-center justify-between px-1">
        <NavButton
          dir="prev"
          disabled={curKey <= minKey}
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, -1))}
        />
        <span className="text-[14px] font-bold">
          {cursor.year}년 {cursor.month + 1}월
        </span>
        <NavButton
          dir="next"
          disabled={curKey >= minKey + MONTHS_AHEAD}
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, 1))}
        />
      </div>

      <div className="mt-2 grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-center text-[11px] font-semibold text-ink-300">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {monthGrid(cursor.year, cursor.month).map((iso, i) => {
          if (!iso) return <span key={`pad-${i}`} />;

          const disabled = iso < today || (limit !== null && iso > limit);
          const isStart = iso === rangeStart;
          const isEnd = rangeEnd !== null && iso === rangeEnd;
          const inRange = rangeEnd !== null && iso > rangeStart && iso < rangeEnd;

          return (
            <span
              key={iso}
              className={`flex h-9 items-center justify-center ${
                rangeEnd !== null && (inRange || isStart || isEnd) ? "bg-brand-50" : ""
              } ${isStart && rangeEnd !== null ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(iso)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] tabular-nums transition ${
                  isStart || isEnd
                    ? "bg-brand-600 font-bold text-white"
                    : disabled
                      ? "text-ink-300/50"
                      : "font-medium text-ink-700 hover:bg-surface"
                }`}
              >
                {Number(iso.slice(8))}
              </button>
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2.5">
        <span className="text-[12px] text-ink-500">
          {from ? "오는 날을 선택해 주세요" : `${nights}박 ${nights + 1}일`}
        </span>
        <button type="button" onClick={onClose} className="text-[12.5px] font-semibold text-brand-700">
          닫기
        </button>
      </div>
    </div>
  );
}

function FieldButton({
  label,
  iso,
  active,
  onClick,
  className = "",
}: {
  label: string;
  /** null이면 아직 고르지 않은 상태 */
  iso: string | null;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-3 text-left transition ${active ? "bg-brand-50" : "hover:bg-surface"} ${className}`}
    >
      <span className="label">{label}</span>
      {/* 좁은 칸에서 "2026년 12월 28일"이 두 줄로 쪼개지지 않게 붙여 둔다 */}
      <span className={`mt-1 block whitespace-nowrap text-[13.5px] font-bold ${iso ? "" : "text-ink-300"}`}>
        {iso ? dateFull(iso) : "날짜 선택"}
      </span>
      <span className="block text-[11.5px] text-ink-500">{iso ? weekdayLong(iso) : " "}</span>
    </button>
  );
}

function NavButton({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir === "prev" ? "이전 달" : "다음 달"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-brand-600 transition enabled:hover:bg-surface disabled:text-ink-300/50"
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}
