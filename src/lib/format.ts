import type {
  BookingStatus,
  MemberType,
  PaymentMethod,
  TeacherCategory,
} from "~/domain/models";

export const categoryLabels: Record<TeacherCategory, string> = {
  teacher: "Profesor",
  head_teacher: "Head profesor",
  master_teacher: "Master profesor",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No-show",
};

export const paymentLabels: Record<PaymentMethod, string> = {
  online: "Online",
  in_person: "En persona",
};
export const memberLabels: Record<MemberType, string> = {
  arabella_member: "Socio Arabella",
  non_member: "No socio",
  unknown: "No lo sé",
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
