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
