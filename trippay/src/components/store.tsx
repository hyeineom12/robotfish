"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { generateTransactions, MEMBER_MAP, MEMBER_SEEDS } from "@/lib/demo";
import { DESTINATION_MAP } from "@/lib/catalog";
import { categoryShares, classifyProfile, groupShares } from "@/lib/analysis";
import type { BudgetBreakdown, Expense, Transaction } from "@/lib/types";

export interface AppState {
  connected: boolean;
  source: "demo" | "csv" | null;
  mode: "solo" | "group" | null;
  memberIds: string[];
  destinationId: string | null;
  nights: number;
  startDate: string;
  budgetTotal: number;
  budget: BudgetBreakdown | null;
  confirmed: boolean;
  expenses: Expense[];
  tripEnded: boolean;
}

const INITIAL: AppState = {
  connected: false,
  source: null,
  mode: null,
  memberIds: ["me"],
  destinationId: null,
  nights: 3,
  startDate: "2026-09-18",
  budgetTotal: 0,
  budget: null,
  confirmed: false,
  expenses: [],
  tripEnded: false,
};

/**
 * 저장 키에 버전을 둔다. 멤버·여행지 같은 마스터 데이터가 바뀌면 버전을 올려서
 * 예전 브라우저에 남아 있는 상태를 그대로 복원하지 않도록 한다.
 */
const KEY = "tripfin-state-v2";
const LEGACY_KEYS = ["tripfin-state-v1"];

/** 지금 데이터에 존재하지 않는 ID가 남아 있어도 앱이 죽지 않도록 정리한다. */
export function sanitize(raw: Partial<AppState>): AppState {
  const s: AppState = { ...INITIAL, ...raw };

  const validMembers = (s.memberIds ?? []).filter((id) => !!MEMBER_MAP[id]);
  s.memberIds = validMembers.includes("me") ? validMembers : ["me", ...validMembers];

  if (s.destinationId && !DESTINATION_MAP[s.destinationId]) {
    s.destinationId = null;
    s.budget = null;
    s.budgetTotal = 0;
    s.confirmed = false;
  }

  s.expenses = (s.expenses ?? []).filter(
    (e) => !!MEMBER_MAP[e.payerId] && (e.participantIds ?? []).some((p) => !!MEMBER_MAP[p])
  );
  s.expenses = s.expenses.map((e) => ({
    ...e,
    participantIds: e.participantIds.filter((p) => !!MEMBER_MAP[p]),
  }));

  if (s.mode === "group" && s.memberIds.length < 2) s.mode = null;

  return s;
}

interface Ctx {
  state: AppState;
  set: (patch: Partial<AppState>) => void;
  reset: () => void;
  ready: boolean;
  myTransactions: Transaction[];
  myShares: ReturnType<typeof categoryShares>;
  myProfile: ReturnType<typeof classifyProfile>;
  groupProfile: ReturnType<typeof classifyProfile>;
  groupSharesValue: ReturnType<typeof categoryShares>;
  members: (typeof MEMBER_MAP)[string][];
}

const TripCtx = createContext<Ctx | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState(sanitize(JSON.parse(raw)));
    } catch {
      // 저장값이 깨졌으면 초기 상태로 시작한다
      try {
        window.localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const set = (patch: Partial<AppState>) => setState((s) => sanitize({ ...s, ...patch }));
  const reset = () => {
    setState(INITIAL);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  const myTransactions = useMemo(() => generateTransactions("cafe_culture", MEMBER_SEEDS.me), []);
  const myShares = useMemo(() => categoryShares(myTransactions), [myTransactions]);
  const myProfile = useMemo(() => classifyProfile(myShares), [myShares]);

  const members = useMemo(
    () => state.memberIds.map((id) => MEMBER_MAP[id]).filter(Boolean),
    [state.memberIds]
  );

  const groupSharesValue = useMemo(() => {
    const list = members.map((m) => {
      if (m.id === "me") return myShares;
      return categoryShares(generateTransactions(m.profileId, MEMBER_SEEDS[m.id] ?? 1));
    });
    return groupShares(list.length ? list : [myShares]);
  }, [members, myShares]);

  const groupProfile = useMemo(() => classifyProfile(groupSharesValue), [groupSharesValue]);

  return (
    <TripCtx.Provider
      value={{ state, set, reset, ready, myTransactions, myShares, myProfile, groupProfile, groupSharesValue, members }}
    >
      {children}
    </TripCtx.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripCtx);
  if (!ctx) throw new Error("useTrip must be used inside TripProvider");
  return ctx;
}
