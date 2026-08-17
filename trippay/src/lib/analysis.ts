import { CATEGORIES, DESTINATIONS, PROFILES } from "./catalog";
import type {
  BudgetBreakdown,
  CategoryId,
  Destination,
  Expense,
  Member,
  ProfileId,
  SettlementTransfer,
  SpendingProfile,
  Transaction,
} from "./types";

/* ─────────────────────────── 1. 소비 프로파일링 ─────────────────────────── */

export function categoryShares(txs: Transaction[]): Record<CategoryId, number> {
  const sums = {} as Record<CategoryId, number>;
  CATEGORIES.forEach((c) => (sums[c.id] = 0));
  let total = 0;
  for (const t of txs) {
    sums[t.category] += t.amount;
    total += t.amount;
  }
  const shares = {} as Record<CategoryId, number>;
  CATEGORIES.forEach((c) => (shares[c.id] = total ? sums[c.id] / total : 0));
  return shares;
}

export function categorySums(txs: Transaction[]): Record<CategoryId, number> {
  const sums = {} as Record<CategoryId, number>;
  CATEGORIES.forEach((c) => (sums[c.id] = 0));
  for (const t of txs) sums[t.category] += t.amount;
  return sums;
}

/** 프로파일별 중심 벡터 (클러스터 centroid) */
const CENTROIDS: Record<ProfileId, Partial<Record<CategoryId, number>>> = {
  cafe_culture: { cafe: 0.24, culture: 0.16, food: 0.2, shopping: 0.1, convenience: 0.08, transport: 0.09 },
  activity: { activity: 0.22, transport: 0.18, food: 0.18, travel: 0.08, convenience: 0.11, cafe: 0.08 },
  gourmet_shopping: { food: 0.3, shopping: 0.24, cafe: 0.12, beauty: 0.08, culture: 0.07 },
  frugal_saver: { convenience: 0.27, food: 0.2, transport: 0.14, cafe: 0.09, etc: 0.08, shopping: 0.08 },
};

/** 코사인 유사도 기반 최근접 클러스터 분류 */
export function classifyProfile(shares: Record<CategoryId, number>): {
  profile: SpendingProfile;
  scores: { id: ProfileId; label: string; score: number }[];
} {
  const scores = (Object.keys(CENTROIDS) as ProfileId[]).map((id) => {
    const c = CENTROIDS[id];
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (const cat of CATEGORIES) {
      const a = shares[cat.id] ?? 0;
      const b = c[cat.id] ?? 0;
      dot += a * b;
      na += a * a;
      nb += b * b;
    }
    const sim = na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
    return { id, label: PROFILES[id].label, score: sim };
  });
  scores.sort((a, b) => b.score - a.score);
  return { profile: PROFILES[scores[0].id], scores };
}

/** 그룹 전체 소비 성향 = 구성원 지분 평균 */
export function groupShares(list: Record<CategoryId, number>[]): Record<CategoryId, number> {
  const out = {} as Record<CategoryId, number>;
  CATEGORIES.forEach((c) => {
    out[c.id] = list.reduce((s, sh) => s + (sh[c.id] ?? 0), 0) / (list.length || 1);
  });
  return out;
}

/* ─────────────────────────── 2. 예산 산정 ─────────────────────────── */

export interface BudgetCapacity {
  monthlySurplus: number;
  safeCap: number; // 권장 상한
  stretchCap: number; // 무리 시 상한
  savingMonths: { months: number; budget: number }[];
}

/**
 * 가용 자산 기반 여행 예산 여력 계산
 * - 유동자산의 35%까지를 안전 한도로 봄 (비상금 보존)
 * - 월 잉여금(수입-지출)의 3개월치를 추가 여력으로 가산
 */
export function budgetCapacity(m: Member): BudgetCapacity {
  const monthlySurplus = Math.max(0, m.monthlyIncome - m.monthlySpend);
  const safeCap = Math.round((m.liquidAssets * 0.35 + monthlySurplus * 1.5) / 10000) * 10000;
  const stretchCap = Math.round((m.liquidAssets * 0.55 + monthlySurplus * 3) / 10000) * 10000;
  const savingMonths = [1, 3, 6].map((months) => ({
    months,
    budget: Math.round((safeCap + monthlySurplus * 0.6 * months) / 10000) * 10000,
  }));
  return { monthlySurplus, safeCap, stretchCap, savingMonths };
}

export function groupBudgetCapacity(members: Member[]): BudgetCapacity {
  const caps = members.map(budgetCapacity);
  // 그룹 예산은 가장 여력이 적은 사람 기준 (아무도 소외되지 않도록)
  const safeCap = Math.min(...caps.map((c) => c.safeCap));
  const stretchCap = Math.min(...caps.map((c) => c.stretchCap));
  const monthlySurplus = Math.min(...caps.map((c) => c.monthlySurplus));
  return {
    monthlySurplus,
    safeCap,
    stretchCap,
    savingMonths: [1, 3, 6].map((months) => ({
      months,
      budget: Math.round((safeCap + monthlySurplus * 0.6 * months) / 10000) * 10000,
    })),
  };
}

/** 목적지 + 숙박일수 기준 예상 비용 (1인) */
export function estimateCost(dest: Destination, nights: number, headcount: number): BudgetBreakdown {
  const days = nights + 1;
  const roomShare = Math.max(1, Math.ceil(headcount / 2)); // 2인 1실
  const stay = Math.round((dest.hotelPerNight * nights * roomShare) / headcount);
  const daily = dest.dailyIndex * days;
  return {
    flight: dest.flightCost,
    stay,
    food: Math.round(daily * 0.45),
    activity: Math.round(daily * 0.3),
    shopping: Math.round(daily * 0.25),
    buffer: Math.round((dest.flightCost + stay + daily) * 0.1),
  };
}

export function breakdownTotal(b: BudgetBreakdown): number {
  return b.flight + b.stay + b.food + b.activity + b.shopping + b.buffer;
}

/** 예산 내에서 갈 수 있는 목적지를 취향 적합도와 함께 랭킹 */
export function rankDestinations(
  shares: Record<CategoryId, number>,
  cap: number,
  nights: number,
  headcount: number
) {
  const { profile } = classifyProfile(shares);
  return DESTINATIONS.map((d) => {
    const b = estimateCost(d, nights, headcount);
    const cost = breakdownTotal(b);
    const fit = d.tags.includes(profile.id) ? 1 : d.tags.length ? 0.55 : 0.5;
    const affordability = Math.min(1, cap / cost);
    const score = Math.round((fit * 0.55 + affordability * 0.45) * 100);
    return { dest: d, breakdown: b, cost, score, within: cost <= cap };
  }).sort((a, b) => b.score - a.score);
}

/* ─────────────────────────── 3. 환율 ─────────────────────────── */

export function toKrw(localAmount: number, fxRate: number): number {
  return Math.round(localAmount * fxRate);
}

/** 카드 수수료 vs 현금 환전 비교 */
export function fxCompare(localAmount: number, dest: Destination, cardFeeRate: number) {
  const base = localAmount * dest.fxRate;
  const cardCost = Math.round(base * (1 + cardFeeRate));
  const cashCost = Math.round(base * 1.0175); // 환전 스프레드 + 수수료 가정
  return {
    cardCost,
    cashCost,
    better: cardCost <= cashCost ? ("card" as const) : ("cash" as const),
    diff: Math.abs(cardCost - cashCost),
  };
}

/* ─────────────────────────── 4. n빵 정산 ─────────────────────────── */

export interface SettlementResult {
  balances: Record<string, number>; // +면 받을 돈, -면 낼 돈
  transfers: SettlementTransfer[];
  total: number;
  perPerson: Record<string, number>;
}

export function settle(expenses: Expense[], memberIds: string[]): SettlementResult {
  const balances: Record<string, number> = {};
  const perPerson: Record<string, number> = {};
  memberIds.forEach((id) => {
    balances[id] = 0;
    perPerson[id] = 0;
  });

  let total = 0;
  for (const e of expenses) {
    total += e.krwAmount;
    const parts = e.participantIds.filter((p) => memberIds.includes(p));
    if (parts.length === 0) continue;
    const share = e.krwAmount / parts.length;
    parts.forEach((p) => {
      balances[p] -= share;
      perPerson[p] += share;
    });
    if (balances[e.payerId] !== undefined) balances[e.payerId] += e.krwAmount;
  }

  // 최소 송금 횟수로 상계
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 1)
    .map(([id, v]) => ({ id, v }))
    .sort((a, b) => b.v - a.v);
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -1)
    .map(([id, v]) => ({ id, v: -v }))
    .sort((a, b) => b.v - a.v);

  const transfers: SettlementTransfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].v, creditors[j].v);
    if (amount > 1) {
      transfers.push({ fromId: debtors[i].id, toId: creditors[j].id, amount: Math.round(amount) });
    }
    debtors[i].v -= amount;
    creditors[j].v -= amount;
    if (debtors[i].v <= 1) i++;
    if (creditors[j].v <= 1) j++;
  }

  return { balances, transfers, total, perPerson };
}

/* ─────────────────────────── 5. 결제 룰렛 ─────────────────────────── */

/** 지금까지 낸 금액이 적을수록 당첨 확률이 올라가는 가중 룰렛 */
export function rouletteWeights(expenses: Expense[], memberIds: string[]) {
  const paid: Record<string, number> = {};
  memberIds.forEach((id) => (paid[id] = 0));
  expenses.forEach((e) => {
    if (paid[e.payerId] !== undefined) paid[e.payerId] += e.krwAmount;
  });
  const max = Math.max(1, ...Object.values(paid));
  const raw = memberIds.map((id) => ({ id, w: 1 + (1 - paid[id] / max) * 1.4 }));
  const sum = raw.reduce((s, r) => s + r.w, 0);
  return raw.map((r) => ({ id: r.id, weight: r.w, prob: r.w / sum, paid: paid[r.id] }));
}

export function spinRoulette(weights: { id: string; prob: number }[]): string {
  let x = Math.random();
  for (const w of weights) {
    x -= w.prob;
    if (x <= 0) return w.id;
  }
  return weights[weights.length - 1].id;
}

/* ─────────────────────────── 6. 과소비 조기경보 ─────────────────────────── */

/**
 * 여행 중 지출이 권장 예산을 얼마나 벗어났는지 판단한다.
 * (2차 확장에서 오토인코더 재구성 오차 기반 탐지로 대체 예정)
 */
export function overspendSignal(dailyBudget: number, todaySpent: number) {
  const ratio = dailyBudget ? todaySpent / dailyBudget : 0;
  if (ratio >= 1.4)
    return { level: "danger" as const, ratio, message: "예산을 크게 넘겼어요. 남은 일정 예산을 다시 나눠볼까요?" };
  if (ratio >= 1.0)
    return { level: "warn" as const, ratio, message: "예산을 넘겼어요. 남은 날에 쓸 돈이 줄어들어요." };
  if (ratio >= 0.75)
    return { level: "info" as const, ratio, message: "예산의 75%를 썼어요. 남은 금액을 확인해 보세요." };
  return { level: "ok" as const, ratio, message: "예산 안에서 잘 쓰고 있어요." };
}
