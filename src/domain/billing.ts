import type { Booking, CompensationLine, DemoData } from "./models";

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
  const eligibleLines = data.compensationLines.filter((line) => {
    const booking = data.bookings.find((item) => item.id === line.bookingId);
    return (
      line.status === "pending" &&
      booking?.startsAt.startsWith(period) &&
      isBookingBillable(booking, data.settings.noShowBillable)
    );
  });
  const byTeacher = Map.groupBy(eligibleLines, (line) => line.teacherId);
  let invoices = data.invoices;
  for (const [teacherId, lines] of byTeacher) {
    const hours = round(lines.reduce((total, line) => total + line.hours, 0));
    const amount = round(lines.reduce((total, line) => total + line.amount, 0));
    const existingInvoice = invoices.find(
      (invoice) =>
        invoice.teacherId === teacherId &&
        invoice.period === period &&
        invoice.status === "generated",
    );

    if (existingInvoice) {
      invoices = invoices.map((invoice) =>
        invoice.id === existingInvoice.id
          ? {
              ...invoice,
              lineIds: [...invoice.lineIds, ...lines.map((line) => line.id)],
              bookingIds: [
                ...invoice.bookingIds,
                ...lines.map((line) => line.bookingId),
              ],
              hours: round(invoice.hours + hours),
              amount: round(invoice.amount + amount),
            }
          : invoice,
      );
      continue;
    }

    invoices = [
      ...invoices,
      {
        id: makeId("inv"),
        teacherId,
        period,
        lineIds: lines.map((line) => line.id),
        bookingIds: lines.map((line) => line.bookingId),
        hours,
        amount,
        status: "generated",
        createdAt: now,
      },
    ];
  }
  const generatedIds = new Set(eligibleLines.map((line) => line.id));
  return {
    ...data,
    compensationLines: data.compensationLines.map((line) =>
      generatedIds.has(line.id)
        ? { ...line, status: "generated" as const }
        : line,
    ),
    invoices,
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
