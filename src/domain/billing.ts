import type {
  Booking,
  CompensationLine,
  DemoData,
  TeacherInvoice,
} from "./models";

export function isBookingBillable(booking: Booking, noShowBillable: boolean) {
  return (
    booking.status === "confirmed" ||
    booking.status === "completed" ||
    (booking.status === "no_show" && noShowBillable)
  );
}

export function generateMonthlyInvoices(
  data: DemoData,
  period: string,
  now = new Date().toISOString(),
) {
  const existingTeachers = new Set(
    data.invoices
      .filter((invoice) => invoice.period === period)
      .map((invoice) => invoice.teacherId),
  );
  const eligibleLines = data.compensationLines.filter((line) => {
    const booking = data.bookings.find((item) => item.id === line.bookingId);
    return (
      line.status === "pending" &&
      booking?.startsAt.startsWith(period) &&
      isBookingBillable(booking, data.settings.noShowBillable)
    );
  });
  const byTeacher = Map.groupBy(eligibleLines, (line) => line.teacherId);
  const invoices: TeacherInvoice[] = [];
  for (const [teacherId, lines] of byTeacher) {
    if (existingTeachers.has(teacherId)) continue;
    invoices.push({
      id: makeId("inv"),
      teacherId,
      period,
      lineIds: lines.map((line) => line.id),
      bookingIds: lines.map((line) => line.bookingId),
      hours: round(lines.reduce((total, line) => total + line.hours, 0)),
      amount: round(lines.reduce((total, line) => total + line.amount, 0)),
      status: "generated",
      createdAt: now,
    });
  }
  const generatedIds = new Set(invoices.flatMap((invoice) => invoice.lineIds));
  return {
    ...data,
    compensationLines: data.compensationLines.map((line) =>
      generatedIds.has(line.id)
        ? { ...line, status: "generated" as const }
        : line,
    ),
    invoices: [...data.invoices, ...invoices],
  };
}

export function createCompensationLine(booking: Booking): CompensationLine {
  const hours = round(
    (new Date(booking.endsAt).getTime() -
      new Date(booking.startsAt).getTime()) /
      3_600_000,
  );
  return {
    id: makeId("line"),
    bookingId: booking.id,
    teacherId: booking.teacherId,
    hours,
    rate: booking.compensationRate,
    amount: booking.teacherCompensation,
    status: "pending",
    createdAt: booking.createdAt,
  };
}

export function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function makeId(prefix: string) {
  const value =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}
