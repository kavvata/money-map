export function hoursToNatural(hours: number): string {
  // NOTE: this considers that someone works 8 hours a day, in a typical 9-to-5.
  const HOURS_PER_DAY = 8;
  const totalMinutes = Math.round(hours * 60);

  const days = Math.floor(totalMinutes / (HOURS_PER_DAY * 60));
  const hrs = Math.floor((totalMinutes % (HOURS_PER_DAY * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hrs) parts.push(`${hrs} hour${hrs !== 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

  return parts.join(", ") || "0 minutes";
}
