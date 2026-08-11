export function seoulMonth(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
  }).formatToParts(new Date());
  return Number(
    parts.find((p) => p.type === "month")?.value ?? new Date().getMonth() + 1
  );
}

export function isSummerMonth(month: number): boolean {
  return month >= 6 && month <= 8;
}

export function isWinterMonth(month: number): boolean {
  return month === 12 || month <= 2;
}
