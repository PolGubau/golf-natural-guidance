import { describe, expect, it } from "vitest";
import { getBusinessInsights } from "~/domain/analytics";
import { createSeed } from "~/infrastructure/seed";

describe("business analytics", () => {
  it("summarises collections, customer health and business performance", () => {
    const seed = createSeed();
    const data = {
      ...seed,
      bookings: [
        ...seed.bookings,
        {
          ...seed.bookings[0],
          id: "booking-pending",
          paymentStatus: "pending" as const,
          status: "completed" as const,
          customerPrice: 100,
          studentId: seed.students[0].id,
        },
        {
          ...seed.bookings[0],
          id: "booking-cancelled",
          status: "cancelled" as const,
        },
      ],
    };

    const insights = getBusinessInsights(data, new Date("2026-08-08T12:00:00"));

    expect(insights.collectedRevenue).toBe(130);
    expect(insights.pendingRevenue).toBe(100);
    expect(insights.confirmedBookings).toBe(2);
    expect(insights.attendanceRate).toBe(1);
    expect(insights.cancellationRate).toBeCloseTo(0.25);
    expect(insights.averageTicket).toBe(65);
    expect(insights.repeatCustomerRate).toBe(0.5);
    expect(insights.services[0]).toMatchObject({
      name: "Clase privada",
      revenue: 85,
      bookings: 1,
    });
    expect(insights.activities[0]).toMatchObject({
      name: "Green Explorers",
      bookedSeats: 1,
      capacity: 8,
    });
  });

  it("places collected payments in a six month revenue series", () => {
    const data = createSeed();
    data.payments[0].createdAt = "2026-06-10T12:00:00";
    data.payments[1].createdAt = "2026-08-02T12:00:00";
    data.payments.push({
      ...data.payments[1],
      id: "payment-partial",
      amount: 10,
      createdAt: "2026-08-04T12:00:00",
    });

    const insights = getBusinessInsights(data, new Date("2026-08-08T12:00:00"));

    expect(insights.revenueByMonth).toEqual([
      { period: "2026-03", label: "mar", revenue: 0, bookings: 0 },
      { period: "2026-04", label: "abr", revenue: 0, bookings: 0 },
      { period: "2026-05", label: "may", revenue: 0, bookings: 0 },
      { period: "2026-06", label: "jun", revenue: 85, bookings: 1 },
      { period: "2026-07", label: "jul", revenue: 0, bookings: 0 },
      { period: "2026-08", label: "ago", revenue: 55, bookings: 1 },
    ]);
  });
});
