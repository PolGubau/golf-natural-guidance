import {
  type Activity,
  type Booking,
  type DemoData,
  type MemberType,
  type PaymentMethod,
  type Teacher,
  teacherCategoryCustomerPrices,
} from "./models";

const occupyingStatuses = new Set(["pending", "confirmed"]);

export type CreateBookingInput = {
  type: "private_lesson" | "group_activity";
  authUserId?: string;
  teacherId: string;
  productId: string;
  activityId?: string;
  startsAt: string;
  endsAt: string;
  playerCount: number;
  memberType: MemberType;
  goal?: string;
  paymentMethod: PaymentMethod;
  customer: {
    name: string;
    email: string;
    phone?: string;
    fiscalId: string;
    fiscalAddress: string;
  };
};

export function overlaps(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return (
    new Date(firstStart) < new Date(secondEnd) &&
    new Date(secondStart) < new Date(firstEnd)
  );
}

export function enrolledCount(activityId: string, bookings: Booking[]) {
  return bookings.filter(
    (booking) =>
      booking.activityId === activityId && booking.status !== "cancelled",
  ).length;
}

export function availablePlaces(activity: Activity, bookings: Booking[]) {
  return Math.max(0, activity.capacity - enrolledCount(activity.id, bookings));
}

export function resolveCustomerPrice(
  activity: Activity | undefined,
  teacher: Teacher,
  memberType: MemberType,
) {
  if (!activity) return teacherCategoryCustomerPrices[teacher.category];
  if (memberType === "arabella_member" && activity.memberPrice != null)
    return activity.memberPrice;
  return activity.price;
}

export function isTeacherBusy(
  teacherId: string,
  startsAt: string,
  endsAt: string,
  bookings: Booking[],
  activities: Activity[],
) {
  const bookingConflict = bookings.some(
    (booking) =>
      booking.teacherId === teacherId &&
      occupyingStatuses.has(booking.status) &&
      overlaps(startsAt, endsAt, booking.startsAt, booking.endsAt),
  );
  const activityConflict = activities.some(
    (activity) =>
      activity.teacherId === teacherId &&
      activity.active &&
      overlaps(startsAt, endsAt, activity.startsAt, activity.endsAt),
  );
  return bookingConflict || activityConflict;
}

export function getAvailableSlots(
  data: DemoData,
  teacherId: string,
  date: string,
) {
  const teacher = data.teachers.find((item) => item.id === teacherId);
  if (!teacher?.active) return [];
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const rules = teacher.availability.filter((rule) => rule.weekday === weekday);
  const slots: { startsAt: string; endsAt: string; available: boolean }[] = [];
  for (const rule of rules) {
    let cursor = toMinutes(rule.startTime);
    const end = toMinutes(rule.endTime);
    while (cursor + data.settings.privateLessonDuration <= end) {
      const startsAt = `${date}T${toTime(cursor)}:00`;
      const endsAt = `${date}T${toTime(cursor + data.settings.privateLessonDuration)}:00`;
      slots.push({
        startsAt,
        endsAt,
        available: !isTeacherBusy(
          teacherId,
          startsAt,
          endsAt,
          data.bookings,
          data.activities,
        ),
      });
      cursor += data.settings.slotIntervalMinutes;
    }
  }
  return slots;
}

export function getAvailableTeacherSlots(data: DemoData, date: string) {
  const grouped = new Map<
    string,
    { startsAt: string; endsAt: string; teachers: Teacher[] }
  >();
  for (const teacher of data.teachers.filter((item) => item.active)) {
    for (const slot of getAvailableSlots(data, teacher.id, date)) {
      if (!slot.available) continue;
      const current = grouped.get(slot.startsAt);
      if (current) current.teachers.push(teacher);
      else grouped.set(slot.startsAt, { ...slot, teachers: [teacher] });
    }
  }
  return [...grouped.values()].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
