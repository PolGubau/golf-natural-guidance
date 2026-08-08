import { createCompensationLine, makeId, round } from "~/domain/billing";
import {
  availablePlaces,
  type CreateBookingInput,
  isTeacherBusy,
  resolveCustomerPrice,
} from "~/domain/booking";
import type { Booking, DemoData, MockPayment, Student } from "~/domain/models";
import { customerSchema } from "~/domain/schemas";

export class BookingError extends Error {}

export function createBooking(
  data: DemoData,
  input: CreateBookingInput,
  now = new Date().toISOString(),
): DemoData {
  const customer = customerSchema.parse(input.customer);
  const teacher = data.teachers.find((item) => item.id === input.teacherId);
  if (!teacher?.active)
    throw new BookingError("El profesor ya no está disponible.");

  const product = data.products.find((item) => item.id === input.productId);
  if (!product?.active || !product.reservable)
    throw new BookingError("Este servicio no se puede reservar.");
  if (
    input.playerCount < product.playersMin ||
    input.playerCount > product.playersMax
  ) {
    throw new BookingError("El número de jugadores no es válido.");
  }

  const activity = input.activityId
    ? data.activities.find((item) => item.id === input.activityId)
    : undefined;
  if (input.type === "group_activity") {
    if (!activity?.active || new Date(activity.endsAt) < new Date(now))
      throw new BookingError("La actividad no está disponible.");
    if (availablePlaces(activity, data.bookings) < 1)
      throw new BookingError("La actividad acaba de completar sus plazas.");
    if (input.paymentMethod !== "online")
      throw new BookingError("Las actividades requieren pago online.");
  } else if (
    isTeacherBusy(
      teacher.id,
      input.startsAt,
      input.endsAt,
      data.bookings,
      data.activities,
    )
  ) {
    throw new BookingError("Esta hora acaba de dejar de estar disponible.");
  }

  const existingStudent = data.students.find(
    (item) => item.email.toLowerCase() === customer.email.toLowerCase(),
  );
  const student: Student = existingStudent ?? {
    id: makeId("student"),
    ...customer,
  };
  const customerPrice = resolveCustomerPrice(
    activity,
    teacher,
    input.memberType,
  );
  const hours =
    (new Date(input.endsAt).getTime() - new Date(input.startsAt).getTime()) /
    3_600_000;
  const booking: Booking = {
    id: makeId("booking"),
    ...input,
    studentId: student.id,
    customerPrice,
    compensationRate: teacher.compensationRate,
    teacherCompensation: round(teacher.compensationRate * hours),
    status: "confirmed",
    paymentStatus: input.paymentMethod === "online" ? "paid" : "pending",
    createdAt: now,
  };
  const payment: MockPayment = {
    id: makeId("payment"),
    bookingId: booking.id,
    amount: booking.customerPrice,
    method: booking.paymentMethod,
    status: booking.paymentStatus,
    createdAt: now,
  };
  return {
    ...data,
    students: existingStudent ? data.students : [...data.students, student],
    bookings: [...data.bookings, booking],
    payments: [...data.payments, payment],
    compensationLines: [
      ...data.compensationLines,
      createCompensationLine(booking),
    ],
  };
}
