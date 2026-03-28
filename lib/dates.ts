/** Returns whole calendar days from local today to target date; negative if past. */
export function calendarDaysFromToday(isoDate: string | undefined): number | null {
  if (!isoDate || typeof isoDate !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const target = new Date(y, mo - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatGunKaldi(days: number | null): string {
  if (days === null) return "";
  if (days < 0) return `${Math.abs(days)} gün önce`;
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  return `${days} gün sonra`;
}
