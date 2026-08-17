/**
 * 날짜는 전부 "YYYY-MM-DD" 문자열로 다루고 계산은 UTC로 한다.
 * 로컬 타임존으로 계산하면 자정 근처에서 하루가 밀린다.
 */

export const toIso = (d: Date) => d.toISOString().slice(0, 10);

export const parseIso = (iso: string) => new Date(iso + "T00:00:00Z");

export const addDays = (iso: string, n: number) => {
  const d = parseIso(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};

export const diffDays = (from: string, to: string) =>
  Math.round((parseIso(to).getTime() - parseIso(from).getTime()) / 86_400_000);

/** 오늘. 브라우저 로컬 날짜를 그대로 ISO로 옮긴다 */
export const todayIso = () => {
  const n = new Date();
  return toIso(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())));
};

/** 월요일 시작 달력 격자. 앞뒤 빈칸은 null */
export function monthGrid(year: number, month: number): (string | null)[] {
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toIso(new Date(Date.UTC(year, month, d))));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** 달을 n칸 옮긴 {year, month} */
export const shiftMonth = (year: number, month: number, n: number) => {
  const d = new Date(Date.UTC(year, month + n, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
};

/** 달 비교용 정렬 키 */
export const monthKey = (year: number, month: number) => year * 12 + month;
