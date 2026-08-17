import type { CategoryId, Member, Transaction } from "./types";

/** 결정론적 난수 (mulberry32) — 새로고침해도 같은 데모 데이터가 나오도록 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MERCHANTS: Record<CategoryId, { name: string; min: number; max: number }[]> = {
  cafe: [
    { name: "블루보틀 삼청", min: 6000, max: 12000 },
    { name: "프릳츠 도화점", min: 5500, max: 14000 },
    { name: "스타벅스 강남R", min: 4500, max: 9000 },
    { name: "노티드 도넛", min: 7000, max: 16000 },
    { name: "카페 온화", min: 5000, max: 11000 },
  ],
  food: [
    { name: "육전식당", min: 18000, max: 42000 },
    { name: "미도인 서초", min: 22000, max: 55000 },
    { name: "김밥천국", min: 6000, max: 12000 },
    { name: "쿠지라이 라멘", min: 11000, max: 19000 },
    { name: "오마카세 하루", min: 90000, max: 160000 },
    { name: "배달의민족", min: 14000, max: 32000 },
  ],
  shopping: [
    { name: "무신사 스토어", min: 39000, max: 180000 },
    { name: "올리브영 온라인", min: 18000, max: 65000 },
    { name: "쿠팡", min: 12000, max: 88000 },
    { name: "현대백화점 판교", min: 60000, max: 320000 },
    { name: "다이소 신촌", min: 3000, max: 18000 },
  ],
  culture: [
    { name: "CGV 용산", min: 14000, max: 28000 },
    { name: "예스24 공연", min: 45000, max: 140000 },
    { name: "국립현대미술관", min: 4000, max: 15000 },
    { name: "교보문고", min: 15000, max: 48000 },
    { name: "넷플릭스", min: 13500, max: 17000 },
  ],
  transport: [
    { name: "티머니 충전", min: 20000, max: 50000 },
    { name: "카카오T 택시", min: 6800, max: 24000 },
    { name: "코레일 KTX", min: 24000, max: 59000 },
    { name: "쏘카", min: 32000, max: 96000 },
  ],
  travel: [
    { name: "야놀자 숙소", min: 70000, max: 220000 },
    { name: "대한항공", min: 180000, max: 460000 },
    { name: "에어비앤비", min: 90000, max: 260000 },
  ],
  convenience: [
    { name: "GS25 역삼", min: 2400, max: 12000 },
    { name: "CU 성수", min: 1800, max: 9000 },
    { name: "이마트24", min: 3000, max: 15000 },
    { name: "홈플러스 온라인", min: 24000, max: 78000 },
  ],
  beauty: [
    { name: "올리브영 명동", min: 15000, max: 72000 },
    { name: "헤어살롱 준", min: 30000, max: 120000 },
    { name: "필라테스 정기결제", min: 120000, max: 190000 },
  ],
  activity: [
    { name: "더클라임 클라이밍", min: 20000, max: 130000 },
    { name: "양양 서핑스쿨", min: 55000, max: 120000 },
    { name: "스크린골프 그린", min: 25000, max: 60000 },
    { name: "데카트론", min: 28000, max: 150000 },
  ],
  etc: [
    { name: "통신요금 자동이체", min: 39000, max: 76000 },
    { name: "애플 구독", min: 6900, max: 16000 },
    { name: "약국", min: 4000, max: 24000 },
  ],
};

/** 프로파일별 카테고리 발생 가중치 */
const WEIGHTS: Record<string, Partial<Record<CategoryId, number>>> = {
  cafe_culture: { cafe: 26, food: 20, culture: 16, shopping: 10, transport: 9, convenience: 8, beauty: 4, activity: 2, travel: 3, etc: 2 },
  activity: { activity: 24, transport: 18, food: 18, convenience: 11, cafe: 8, travel: 8, shopping: 6, culture: 4, beauty: 1, etc: 2 },
  gourmet_shopping: { food: 30, shopping: 24, cafe: 12, beauty: 8, culture: 7, transport: 7, convenience: 5, travel: 4, activity: 1, etc: 2 },
  frugal_saver: { convenience: 28, food: 20, transport: 14, cafe: 9, etc: 8, shopping: 8, culture: 6, beauty: 4, activity: 2, travel: 1 },
};

function pickWeighted(r: () => number, weights: Partial<Record<CategoryId, number>>): CategoryId {
  const entries = Object.entries(weights) as [CategoryId, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [k, w] of entries) {
    x -= w;
    if (x <= 0) return k;
  }
  return entries[0][0];
}

/** 최근 6개월치 카드 거래내역 생성 */
export function generateTransactions(profileId: string, seed: number, months = 6): Transaction[] {
  const r = rng(seed);
  const weights = WEIGHTS[profileId] ?? WEIGHTS.frugal_saver;
  const out: Transaction[] = [];
  const today = new Date("2026-08-12T00:00:00Z");

  for (let m = months - 1; m >= 0; m--) {
    const base = new Date(today);
    base.setUTCMonth(base.getUTCMonth() - m);
    const daysInMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
    const count = 28 + Math.floor(r() * 16);
    for (let i = 0; i < count; i++) {
      const day = 1 + Math.floor(r() * daysInMonth);
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), day));
      if (d > today) continue;
      const category = pickWeighted(r, weights);
      const pool = MERCHANTS[category];
      const merchant = pool[Math.floor(r() * pool.length)];
      const amount = Math.round((merchant.min + r() * (merchant.max - merchant.min)) / 100) * 100;
      out.push({
        id: `${seed}-${m}-${i}`,
        date: d.toISOString().slice(0, 10),
        merchant: merchant.name,
        category,
        amount,
      });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const MEMBERS: Member[] = [
  {
    id: "me",
    name: "엄혜인",
    photo: "/members/hyein.jpg",
    isMe: true,
    profileId: "cafe_culture",
    monthlyIncome: 3_200_000,
    monthlySpend: 1_950_000,
    liquidAssets: 6_400_000,
    cardIds: ["card_hana_travlog", "card_hyundai_zero"],
    categoryShares: {} as Member["categoryShares"],
  },
  {
    id: "u_jeongmin",
    name: "정민",
    photo: "/members/jeongmin.jpg",
    profileId: "activity",
    monthlyIncome: 3_600_000,
    monthlySpend: 2_400_000,
    liquidAssets: 4_100_000,
    cardIds: ["card_shinhan_soltravel", "card_travelwallet"],
    categoryShares: {} as Member["categoryShares"],
  },
  {
    id: "u_donggeon",
    name: "김동건",
    photo: "/members/donggeon.jpg",
    profileId: "gourmet_shopping",
    monthlyIncome: 4_100_000,
    monthlySpend: 3_200_000,
    liquidAssets: 5_200_000,
    cardIds: ["card_kb_travelers"],
    categoryShares: {} as Member["categoryShares"],
  },
  {
    id: "u_hyeonho",
    name: "서현호",
    photo: "/members/hyeonho.jpg",
    profileId: "frugal_saver",
    monthlyIncome: 2_900_000,
    monthlySpend: 1_450_000,
    liquidAssets: 8_900_000,
    cardIds: ["card_nh_travely", "card_toss"],
    categoryShares: {} as Member["categoryShares"],
  },
  {
    id: "u_suhyeon",
    name: "이수현",
    photo: "/members/suhyeon.jpg",
    profileId: "cafe_culture",
    monthlyIncome: 3_400_000,
    monthlySpend: 2_150_000,
    liquidAssets: 5_800_000,
    cardIds: ["card_woori_wibee", "card_samsung_taptap"],
    categoryShares: {} as Member["categoryShares"],
  },
];

export const MEMBER_SEEDS: Record<string, number> = {
  me: 20260812,
  u_jeongmin: 771,
  u_donggeon: 4242,
  u_hyeonho: 90210,
  u_suhyeon: 3311,
};

export const MEMBER_MAP: Record<string, Member> = MEMBERS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<string, Member>
);
