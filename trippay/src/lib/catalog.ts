import type { Category, CategoryId, CardProduct, Destination, SpendingProfile } from "./types";

export const CATEGORIES: Category[] = [
  { id: "cafe", label: "카페·디저트", color: "#b07a4a" },
  { id: "food", label: "식비", color: "#f9584a" },
  { id: "shopping", label: "쇼핑", color: "#e0498f" },
  { id: "culture", label: "문화·여가", color: "#7a5af5" },
  { id: "transport", label: "교통", color: "#3b82f6" },
  { id: "travel", label: "여행·숙박", color: "#12b98c" },
  { id: "convenience", label: "편의점·마트", color: "#f59e0b" },
  { id: "beauty", label: "뷰티·건강", color: "#ec4899" },
  { id: "activity", label: "액티비티", color: "#0ea5e9" },
  { id: "etc", label: "기타", color: "#94a3b8" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, Category>
);

export const PROFILES: Record<string, SpendingProfile> = {
  cafe_culture: {
    id: "cafe_culture",
    label: "카페·문화생활형",
    description:
      "카페와 전시, 공연에 쓰는 돈이 또래보다 많아요. 한곳에 오래 머물면서 공간과 경험에 지갑을 여는 편이에요.",
    travelStyle: ["여유로운 일정", "카페·서점·미술관 중심", "숙소 퀄리티 중시"],
    color: "#b07a4a",
  },
  activity: {
    id: "activity",
    label: "액티비티형",
    description:
      "스포츠와 레저, 교통비 비중이 높아요. 주말 이동 반경이 넓고 새로운 체험에 돈을 쓰는 편이에요.",
    travelStyle: ["일정이 빽빽한 여행", "체험·투어 예약 선호", "숙소는 잠만 자면 충분"],
    color: "#0ea5e9",
  },
  gourmet_shopping: {
    id: "gourmet_shopping",
    label: "미식·쇼핑형",
    description:
      "외식과 쇼핑이 전체 지출의 절반을 넘어요. 한 번 쓸 때 금액이 큰 편이에요.",
    travelStyle: ["맛집 중심 동선", "쇼핑 예산 따로 확보", "야시장·미식 투어 선호"],
    color: "#e0498f",
    image: "/profiles/gourmet_shopping.jpg",
  },
  frugal_saver: {
    id: "frugal_saver",
    label: "알뜰·실속형",
    description:
      "편의점과 마트처럼 생활에 밀착된 소비가 많아요. 고정지출 대비 저축하는 비율이 높은 편이에요.",
    travelStyle: ["예산 상한을 꼭 지킴", "무료 명소·로컬 식당", "가까운 곳을 자주"],
    color: "#12b98c",
  },
};

/**
 * 실제 국내 카드 상품 기준으로 구성했어요.
 * 혜택 조건은 카드사 정책에 따라 바뀔 수 있어 데모용 기준값으로 표기합니다.
 */
export const CARDS: CardProduct[] = [
  {
    id: "card_kb_travelers",
    name: "KB국민 트래블러스 체크카드",
    issuer: "KB국민카드",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 0%", "해외 ATM 인출 수수료 면제", "주요 통화 환전 수수료 무료"],
    bestFor: ["travel", "transport"],
    loungePass: 0,
  },
  {
    id: "card_hana_travlog",
    name: "하나 트래블로그 체크카드",
    issuer: "하나카드",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 0%", "58종 통화 환전 수수료 무료", "공항 라운지 연 2회"],
    bestFor: ["travel", "transport"],
    loungePass: 2,
  },
  {
    id: "card_shinhan_soltravel",
    name: "신한 SOL트래블 체크카드",
    issuer: "신한카드",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 0%", "공항 라운지 연 2회", "해외 가맹점 캐시백"],
    bestFor: ["travel", "food"],
    loungePass: 2,
  },
  {
    id: "card_woori_wibee",
    name: "우리 위비트래블 체크카드",
    issuer: "우리카드",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 0%", "해외 ATM 인출 수수료 면제"],
    bestFor: ["travel", "convenience"],
    loungePass: 0,
  },
  {
    id: "card_nh_travely",
    name: "NH농협 트래블리 체크카드",
    issuer: "NH농협카드",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 0%", "주요 통화 환전 수수료 무료", "해외 ATM 인출 수수료 면제"],
    bestFor: ["travel", "convenience"],
    loungePass: 0,
  },
  {
    id: "card_travelwallet",
    name: "트래블월렛 트래블페이",
    issuer: "트래블월렛",
    type: "체크",
    fxFeeRate: 0,
    perks: ["여러 통화를 미리 충전해서 결제", "해외 결제 수수료 0%", "해외 ATM 인출 수수료 면제"],
    bestFor: ["travel", "transport"],
    loungePass: 0,
  },
  {
    id: "card_toss",
    name: "토스뱅크 체크카드",
    issuer: "토스뱅크",
    type: "체크",
    fxFeeRate: 0,
    perks: ["해외 결제 수수료 무료", "편의점·카페 즉시 캐시백"],
    bestFor: ["convenience", "cafe"],
    loungePass: 0,
  },
  {
    id: "card_hyundai_zero",
    name: "현대카드 ZERO Edition3",
    issuer: "현대카드",
    type: "신용",
    fxFeeRate: 0.018,
    perks: ["국내외 모든 가맹점 0.8% 할인", "전월 실적 조건 없음"],
    bestFor: ["food", "culture"],
    loungePass: 0,
  },
  {
    id: "card_samsung_taptap",
    name: "삼성카드 taptap O",
    issuer: "삼성카드",
    type: "신용",
    fxFeeRate: 0.012,
    perks: ["온라인 쇼핑 최대 10% 할인", "커피·영화 할인"],
    bestFor: ["shopping", "beauty"],
    loungePass: 0,
  },
];

export const CARD_MAP: Record<string, CardProduct> = CARDS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, CardProduct>
);

export const DESTINATIONS: Destination[] = [
  {
    id: "osaka",
    city: "오사카",
    country: "일본",
    flag: "🇯🇵",
    image: "/destinations/osaka.jpg",
    currency: "JPY",
    currencySymbol: "¥",
    fxRate: 9.42,
    flightCost: 260000,
    dailyIndex: 95000,
    hotelPerNight: 130000,
    tags: ["gourmet_shopping", "frugal_saver"],
    blurb: "항공권이 저렴해서 예산을 지키기 쉬워요. 먹는 데 집중하는 일정에 잘 맞아요.",
    gradient: "from-rose-400 to-orange-300",
  },
  {
    id: "taipei",
    city: "타이베이",
    country: "대만",
    flag: "🇹🇼",
    image: "/destinations/taipei.jpg",
    currency: "TWD",
    currencySymbol: "NT$",
    fxRate: 44.8,
    flightCost: 320000,
    dailyIndex: 78000,
    hotelPerNight: 110000,
    tags: ["frugal_saver", "gourmet_shopping"],
    blurb: "물가가 낮아서 같은 예산으로 더 오래 머물 수 있어요.",
    gradient: "from-amber-400 to-lime-300",
  },
  {
    id: "danang",
    city: "다낭",
    country: "베트남",
    flag: "🇻🇳",
    image: "/destinations/danang.jpg",
    currency: "VND",
    currencySymbol: "₫",
    fxRate: 0.0533,
    flightCost: 420000,
    dailyIndex: 70000,
    hotelPerNight: 95000,
    tags: ["activity", "frugal_saver"],
    blurb: "서핑, 스노클링 같은 체험 비용이 낮아요. 활동적인 일정에 잘 맞아요.",
    gradient: "from-cyan-400 to-emerald-300",
  },
  {
    id: "kyoto",
    city: "교토",
    country: "일본",
    flag: "🇯🇵",
    image: "/destinations/kyoto.jpg",
    currency: "JPY",
    currencySymbol: "¥",
    fxRate: 9.42,
    flightCost: 290000,
    dailyIndex: 105000,
    hotelPerNight: 155000,
    tags: ["cafe_culture"],
    blurb: "찻집과 사찰, 공방 중심이에요. 천천히 도는 일정을 좋아한다면 잘 맞아요.",
    gradient: "from-violet-400 to-fuchsia-300",
  },
  {
    id: "singapore",
    city: "싱가포르",
    country: "싱가포르",
    flag: "🇸🇬",
    image: "/destinations/singapore.jpg",
    currency: "SGD",
    currencySymbol: "S$",
    fxRate: 1045,
    flightCost: 620000,
    dailyIndex: 165000,
    hotelPerNight: 240000,
    tags: ["gourmet_shopping", "cafe_culture"],
    blurb: "물가는 높지만 이동 거리가 짧아요. 짧은 일정에 많은 걸 담을 수 있어요.",
    gradient: "from-indigo-400 to-sky-300",
  },
];

export const DESTINATION_MAP: Record<string, Destination> = DESTINATIONS.reduce(
  (acc, d) => ({ ...acc, [d.id]: d }),
  {} as Record<string, Destination>
);

/** 계좌 연결 화면에 노출되는 금융기관 */
export interface Institution {
  name: string;
  logo?: string;
  /** 로고가 없을 때 표시할 배지 색 */
  color?: string;
}

export const INSTITUTIONS: { group: string; items: Institution[] }[] = [
  {
    group: "은행",
    items: [
      { name: "KB국민은행", logo: "/banks/kb.png" },
      { name: "신한은행", logo: "/banks/shinhan.png" },
      { name: "하나은행", logo: "/banks/hana.png" },
      { name: "우리은행", logo: "/banks/woori.png" },
      { name: "NH농협은행", logo: "/banks/nh.svg" },
      { name: "IBK기업은행", logo: "/banks/ibk.svg" },
      { name: "카카오뱅크", logo: "/banks/kakaobank.png" },
      { name: "토스뱅크", logo: "/banks/tossbank.png" },
      { name: "케이뱅크", logo: "/banks/kbank.png" },
    ],
  },
  {
    group: "카드",
    items: [
      { name: "KB국민카드", logo: "/banks/kb.png" },
      { name: "신한카드", logo: "/banks/shinhan.png" },
      { name: "하나카드", logo: "/banks/hana.png" },
      { name: "우리카드", logo: "/banks/woori.png" },
      { name: "삼성카드", logo: "/banks/samsungcard.png" },
      { name: "현대카드", logo: "/banks/hyundaicard.png" },
      { name: "롯데카드", logo: "/banks/lotte.png" },
      { name: "BC카드", logo: "/banks/bccard.svg" },
    ],
  },
];
