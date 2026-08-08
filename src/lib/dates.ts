export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function upcomingDays(count = 7) {
  return Array.from({ length: count }, (_, index) =>
    addDays(new Date(), index + 1),
  );
}

export function monthKey(date = new Date()) {
  return localDateKey(date).slice(0, 7);
}
