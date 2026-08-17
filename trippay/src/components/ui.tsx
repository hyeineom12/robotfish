"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_MAP } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import { krw, pct } from "@/lib/format";
import type { CategoryId } from "@/lib/types";

export function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // 실제 폰에서는 화면 높이를, 목업 안에서는 iPhone 16 높이(852pt)를 채운다
  return <div className={`flex min-h-[100svh] flex-col frame:min-h-[852px] ${className}`}>{children}</div>;
}

export function TopBar({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 bg-white/95 px-5 pb-3 pt-9 backdrop-blur">
      {back && (
        <button
          onClick={() => router.push(back)}
          aria-label="뒤로"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-surface"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-ink-500">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 space-y-4 px-5 py-5 ${className}`}>{children}</div>;
}

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-20 border-t border-black/5 bg-white/95 px-5 pt-3 backdrop-blur">
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-end justify-between px-0.5">
      <h2 className="text-[15px] font-bold">{children}</h2>
      {hint && <span className="text-[11px] text-ink-300">{hint}</span>}
    </div>
  );
}

/**
 * 마침표 뒤에서 줄을 나눠 쓰는 본문.
 * 문장이 줄 끝에서 끊겨 잘린 것처럼 보이는 걸 막고, 한국어 어절도 쪼개지지 않게 흘린다.
 */
export function Sentences({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-0.5 break-keep ${className}`}>
      {text
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
    </div>
  );
}

export function AiBadge({ children = "AI 분석" }: { children?: React.ReactNode }) {
  return <span className="chip bg-brand-50 text-brand-700">{children}</span>;
}

/** 프로필 사진 아바타 */
export function Avatar({
  src,
  name,
  size = 36,
  className = "",
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-surface ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={asset(src)} alt={name} fill sizes={`${size * 3}px`} className="object-cover" />
    </span>
  );
}

/** 카테고리 색상 점 */
export function Dot({ category, size = 8 }: { category: CategoryId; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: CATEGORY_MAP[category].color }}
    />
  );
}

export function CategoryBar({ shares, limit = 5 }: { shares: Record<CategoryId, number>; limit?: number }) {
  const rows = Object.entries(shares)
    .map(([id, v]) => ({ cat: CATEGORY_MAP[id as CategoryId], v }))
    .filter((r) => r.cat && r.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, limit);
  const max = rows[0]?.v ?? 1;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.cat.id} className="flex items-center gap-2.5">
          <span className="flex w-[86px] shrink-0 items-center gap-1.5 text-[12px] text-ink-700">
            <Dot category={r.cat.id} />
            <span className="truncate">{r.cat.label}</span>
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(r.v / max) * 100}%`, background: r.cat.color }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums">{pct(r.v)}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(1.5, value));
  const deg = Math.min(360, clamped * 240);
  const color = clamped >= 1 ? "#f9584a" : clamped >= 0.75 ? "#f59e0b" : "#12b98c";
  return (
    <div className="relative h-28 w-28 shrink-0">
      <div
        className="h-full w-full rounded-full transition-all duration-700"
        style={{ background: `conic-gradient(${color} ${deg}deg, #eceef5 ${deg}deg)` }}
      />
      <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[19px] font-bold leading-none" style={{ color }}>
          {Math.round(clamped * 100)}%
        </span>
        <span className="mt-1 text-[10px] text-ink-500">{label}</span>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1">
      <div className="text-[11px] text-ink-500">{label}</div>
      <div className="mt-0.5 text-[16px] font-bold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-ink-300">{sub}</div>}
    </div>
  );
}

export function MoneyRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-[13px] ${strong ? "font-bold" : "text-ink-500"}`}>{label}</span>
      <span className={`tabular-nums ${strong ? "text-[15px] font-bold" : "text-[13px] font-medium"}`}>
        {krw(value)}
      </span>
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "line";
  className?: string;
}) {
  const cls = variant === "primary" ? "btn-primary" : variant === "ghost" ? "btn-ghost" : "btn-line";
  return (
    <Link href={href} className={`${cls} w-full ${className}`}>
      {children}
    </Link>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "danger" | "ok";
  children: React.ReactNode;
}) {
  const tones = {
    info: "bg-brand-50 text-brand-700",
    warn: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-600",
    ok: "bg-emerald-50 text-emerald-700",
  };
  return <div className={`rounded-2xl px-3.5 py-3 text-[12.5px] leading-relaxed ${tones[tone]}`}>{children}</div>;
}
