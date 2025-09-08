export function parseApiDate(dateStr: string): string {
  const [month, day, year] = dateStr.split("/");
  const fullYear = Number(year) < 50 ? `20${year}` : `19${year}`;
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");

  return `${fullYear}-${mm}-${dd}`;
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function groupByPeriod(
  data: Record<string, number>,
  period: "day" | "week" | "month",
  start?: string,
  end?: string
) {
  const result: Record<string, number> = {};

  for (const [dateStr, value] of Object.entries(data)) {
    const iso = parseApiDate(dateStr);

    if (start && iso < start) continue;
    if (end && iso > end) continue;

    let key = iso;
    if (period === "week") {
      const d = new Date(iso);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      const week =
        1 +
        Math.round(
          ((d.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        );
      key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }
    if (period === "month") {
      const [year, month] = iso.split("-");
      key = `${year}-${month}`;
    }

    result[key] = (result[key] || 0) + value;
  }

  return result;
}
