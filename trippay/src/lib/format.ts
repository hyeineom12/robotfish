export const krw = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
export const krwShort = (n: number) => {
  const v = Math.round(n);
  if (Math.abs(v) >= 10000) {
    const man = v / 10000;
    return `${man % 1 === 0 ? man : man.toFixed(1)}만원`;
  }
  return `${v.toLocaleString("ko-KR")}원`;
};
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;
export const localMoney = (n: number, symbol: string) =>
  `${symbol}${n.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
const weekdayOf = (iso: string) =>
  ["일", "월", "화", "수", "목", "금", "토"][new Date(iso + "T00:00:00Z").getUTCDay()];

export const dateLabel = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return `${d.getUTCMonth() + 1}.${d.getUTCDate()}(${weekdayOf(iso)})`;
};
export const dateFull = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
};
export const weekdayLong = (iso: string) => `${weekdayOf(iso)}요일`;
