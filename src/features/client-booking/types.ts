import type { MemberType, PaymentMethod } from "~/domain/models";
import type { CustomerForm } from "~/domain/schemas";

export type BookingDraft = {
  mode: "private_lesson" | "group_activity" | null;
  discoveryMode: "schedule_first" | "teacher_first" | "activity_first" | null;
  teacherId: string;
  productId: string;
  activityId?: string;
  date: string;
  startsAt: string;
  endsAt: string;
  playerCount: number;
  memberType: MemberType;
  goal: string;
  paymentMethod: PaymentMethod;
  customer?: CustomerForm;
};
