import { makeId } from "~/domain/billing";
import type {
  Activity,
  AvailabilityRule,
  BookingStatus,
  DemoData,
  Teacher,
} from "~/domain/models";
import type { ActivityForm, TeacherForm } from "~/domain/schemas";

const defaultAvailability = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  startTime: "08:00",
  endTime: "18:00",
}));

export function saveTeacher(
  data: DemoData,
  values: TeacherForm,
  teacherId?: string,
  availability?: AvailabilityRule[],
): DemoData {
  const current = data.teachers.find((teacher) => teacher.id === teacherId);
  const teacher: Teacher = {
    id: current?.id ?? makeId("teacher"),
    availability: availability ?? current?.availability ?? defaultAvailability,
    ...values,
  };
  return {
    ...data,
    teachers: current
      ? data.teachers.map((item) => (item.id === current.id ? teacher : item))
      : [...data.teachers, teacher],
  };
}

export function saveActivity(
  data: DemoData,
  values: ActivityForm,
  activityId?: string,
): DemoData {
  if (new Date(values.endsAt) <= new Date(values.startsAt))
    throw new Error("La hora de fin debe ser posterior.");
  const current = data.activities.find(
    (activity) => activity.id === activityId,
  );
  const productId = current?.productId ?? "product-group";
  const activity: Activity = {
    id: current?.id ?? makeId("activity"),
    productId,
    requiresOnlinePayment: true,
    color: current?.color ?? "#ee7b56",
    ...values,
  };
  return {
    ...data,
    activities: current
      ? data.activities.map((item) =>
          item.id === current.id ? activity : item,
        )
      : [...data.activities, activity],
  };
}

export function updateBookingStatus(
  data: DemoData,
  bookingId: string,
  status: BookingStatus,
): DemoData {
  return {
    ...data,
    bookings: data.bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status } : booking,
    ),
    compensationLines: data.compensationLines.map((line) =>
      line.bookingId === bookingId && line.status === "pending"
        ? {
            ...line,
            status: status === "cancelled" ? ("void" as const) : line.status,
          }
        : line,
    ),
  };
}
