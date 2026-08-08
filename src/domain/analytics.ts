import { localDateKey } from "~/lib/dates";
import type { DemoData } from "./models";

const bookedStatuses = new Set(["confirmed", "completed", "no_show"]);

export type BusinessInsights = {
  collectedRevenue: number;
  pendingRevenue: number;
  confirmedBookings: number;
  attendanceRate: number | null;
  cancellationRate: number | null;
  averageTicket: number | null;
  repeatCustomerRate: number | null;
  revenueByMonth: {
    period: string;
    label: string;
    revenue: number;
    bookings: number;
  }[];
  services: { name: string; revenue: number; bookings: number }[];
  teachers: {
    name: string;
    color: string;
    revenue: number;
    bookings: number;
  }[];
  activities: {
    name: string;
    color: string;
    bookedSeats: number;
    capacity: number;
    occupancyRate: number;
  }[];
};

export function getBusinessInsights(
  data: DemoData,
  now = new Date(),
): BusinessInsights {
  const paidPayments = data.payments.filter(
    (payment) => payment.status === "paid",
  );
  const paidByBooking = new Map<string, number>();
  for (const payment of paidPayments) {
    paidByBooking.set(
      payment.bookingId,
      (paidByBooking.get(payment.bookingId) ?? 0) + payment.amount,
    );
  }

  const collectedRevenue = sum(paidPayments.map((payment) => payment.amount));
  const pendingRevenue = sum(
    data.bookings
      .filter(
        (booking) =>
          booking.paymentStatus === "pending" &&
          (booking.status === "confirmed" || booking.status === "completed"),
      )
      .map((booking) => booking.customerPrice),
  );
  const completedOrNoShow = data.bookings.filter(
    (booking) => booking.status === "completed" || booking.status === "no_show",
  );
  const bookers = new Map<string, number>();
  for (const booking of data.bookings.filter((booking) =>
    bookedStatuses.has(booking.status),
  )) {
    bookers.set(booking.studentId, (bookers.get(booking.studentId) ?? 0) + 1);
  }

  return {
    collectedRevenue,
    pendingRevenue,
    confirmedBookings: data.bookings.filter(
      (booking) => booking.status === "confirmed",
    ).length,
    attendanceRate: ratio(
      completedOrNoShow.filter((booking) => booking.status === "completed")
        .length,
      completedOrNoShow.length,
    ),
    cancellationRate: ratio(
      data.bookings.filter((booking) => booking.status === "cancelled").length,
      data.bookings.length,
    ),
    averageTicket: ratio(collectedRevenue, paidByBooking.size),
    repeatCustomerRate: ratio(
      [...bookers.values()].filter((count) => count > 1).length,
      bookers.size,
    ),
    revenueByMonth: buildRevenueByMonth(paidPayments, now),
    services: buildServicePerformance(data, paidByBooking),
    teachers: buildTeacherPerformance(data, paidByBooking),
    activities: buildActivityOccupancy(data, now),
  };
}

function buildRevenueByMonth(payments: DemoData["payments"], now: Date) {
  return getMonthPeriods(now).map(({ period, label }) => {
    const collectedPayments = payments.filter(
      (payment) =>
        payment.createdAt.startsWith(period) && payment.status === "paid",
    );
    return {
      period,
      label,
      revenue: sum(collectedPayments.map((payment) => payment.amount)),
      bookings: new Set(collectedPayments.map((payment) => payment.bookingId))
        .size,
    };
  });
}

function buildServicePerformance(
  data: DemoData,
  paidByBooking: Map<string, number>,
) {
  const byService = new Map<string, { revenue: number; bookings: number }>();
  for (const booking of data.bookings) {
    const revenue = paidByBooking.get(booking.id);
    if (!revenue) continue;
    const activity = data.activities.find(
      (item) => item.id === booking.activityId,
    );
    const product = data.products.find((item) => item.id === booking.productId);
    const name = activity?.name ?? product?.name ?? "Servicio sin nombre";
    const current = byService.get(name) ?? { revenue: 0, bookings: 0 };
    byService.set(name, {
      revenue: current.revenue + revenue,
      bookings: current.bookings + 1,
    });
  }
  return [...byService.entries()]
    .map(([name, values]) => ({ name, ...values }))
    .sort((a, b) => b.revenue - a.revenue);
}

function buildTeacherPerformance(
  data: DemoData,
  paidByBooking: Map<string, number>,
) {
  const byTeacher = new Map<string, { revenue: number; bookings: number }>();
  for (const booking of data.bookings) {
    const revenue = paidByBooking.get(booking.id);
    if (!revenue) continue;
    const current = byTeacher.get(booking.teacherId) ?? {
      revenue: 0,
      bookings: 0,
    };
    byTeacher.set(booking.teacherId, {
      revenue: current.revenue + revenue,
      bookings: current.bookings + 1,
    });
  }
  return [...byTeacher.entries()]
    .map(([teacherId, values]) => {
      const teacher = data.teachers.find((item) => item.id === teacherId);
      return {
        name: teacher?.name ?? "Profesor sin nombre",
        color: teacher?.color ?? "#68736c",
        ...values,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildActivityOccupancy(data: DemoData, now: Date) {
  const today = localDateKey(now);
  return data.activities
    .filter(
      (activity) => activity.active && activity.startsAt.slice(0, 10) >= today,
    )
    .map((activity) => {
      const bookedSeats = sum(
        data.bookings
          .filter(
            (booking) =>
              booking.activityId === activity.id &&
              bookedStatuses.has(booking.status),
          )
          .map((booking) => booking.playerCount),
      );
      return {
        name: activity.name,
        color: activity.color,
        bookedSeats,
        capacity: activity.capacity,
        occupancyRate: ratio(bookedSeats, activity.capacity) ?? 0,
      };
    })
    .sort((a, b) => b.occupancyRate - a.occupancyRate);
}

function getMonthPeriods(now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      period: localDateKey(date).slice(0, 7),
      label: new Intl.DateTimeFormat("es-ES", { month: "short" })
        .format(date)
        .replace(".", ""),
    };
  });
}

function ratio(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : null;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
