export type CategoryId =
  | "cafe"
  | "food"
  | "shopping"
  | "culture"
  | "transport"
  | "travel"
  | "convenience"
  | "beauty"
  | "activity"
  | "etc";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  category: CategoryId;
  amount: number; // KRW
}

export type ProfileId = "cafe_culture" | "activity" | "gourmet_shopping" | "frugal_saver";

export interface SpendingProfile {
  id: ProfileId;
  label: string;
  description: string;
  travelStyle: string[];
  color: string;
  /** 프로파일 배너 배경 사진. 없으면 브랜드 그라디언트로 그린다 */
  image?: string;
}

export interface CardProduct {
  id: string;
  name: string;
  issuer: string;
  type: "체크" | "신용";
  fxFeeRate: number; // 0.018 = 1.8%
  perks: string[];
  bestFor: CategoryId[];
  loungePass: number;
}

export interface Member {
  id: string;
  name: string;
  photo: string;
  isMe?: boolean;
  profileId: ProfileId;
  monthlyIncome: number;
  monthlySpend: number;
  liquidAssets: number;
  cardIds: string[];
  categoryShares: Record<CategoryId, number>;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  flag: string;
  image: string;
  currency: string;
  currencySymbol: string;
  fxRate: number;
  flightCost: number;
  dailyIndex: number;
  hotelPerNight: number;
  tags: ProfileId[];
  blurb: string;
  gradient: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  place: string;
  category: CategoryId;
  estCost: number;
  note?: string;
  koreanReview?: string;
  /** 지도 표시용 좌표. 장소·건물 수준의 근사값이다 */
  lat?: number;
  lng?: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  items: ItineraryItem[];
}

export interface BudgetBreakdown {
  flight: number;
  stay: number;
  food: number;
  activity: number;
  shopping: number;
  buffer: number;
}

export interface Expense {
  id: string;
  createdAt: number;
  merchant: string;
  category: CategoryId;
  localAmount: number;
  currency: string;
  krwAmount: number;
  payerId: string;
  participantIds: string[];
  /** 룰렛 당첨자가 전액 부담한 '쏘기' 결제 */
  isTreat?: boolean;
  memo?: string;
}

export interface SettlementTransfer {
  fromId: string;
  toId: string;
  amount: number;
}
