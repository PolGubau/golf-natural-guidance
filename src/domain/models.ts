export type TeacherCategory = "teacher" | "head_teacher" | "master_teacher";
export type ProductType =
  | "private_lesson"
  | "private_package"
  | "group_course"
  | "junior_subscription"
  | "junior_package"
  | "experience"
  | "camp"
  | "custom_program";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentMethod = "online" | "in_person";
export type PaymentStatus = "pending" | "paid";
export type MemberType = "arabella_member" | "non_member" | "unknown";

export type AvailabilityRule = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type Teacher = {
  id: string;
  name: string;
  photoUrl?: string;
  publicRole: string;
  category: TeacherCategory;
  customerPrice: number;
  compensationRate: number;
  active: boolean;
  availability: AvailabilityRule[];
  color: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  durationMinutes: number;
  playersMin: number;
  playersMax: number;
  active: boolean;
  reservable: boolean;
  priceOnRequest?: boolean;
};

export type Activity = {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  memberPrice?: number;
  capacity: number;
  teacherId: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  requiresOnlinePayment: boolean;
  color: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type Booking = {
  id: string;
  type: "private_lesson" | "group_activity";
  studentId: string;
  teacherId: string;
  productId: string;
  activityId?: string;
  startsAt: string;
  endsAt: string;
  playerCount: number;
  memberType: MemberType;
  goal?: string;
  customerPrice: number;
  teacherCompensation: number;
  compensationRate: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type MockPayment = {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
};

export type CompensationLine = {
  id: string;
  bookingId: string;
  teacherId: string;
  hours: number;
  rate: number;
  amount: number;
  status: "pending" | "generated" | "void";
  createdAt: string;
};

export type TeacherInvoice = {
  id: string;
  teacherId: string;
  period: string;
  lineIds: string[];
  bookingIds: string[];
  hours: number;
  amount: number;
  status: "generated" | "paid";
  createdAt: string;
};

export type DemoSettings = {
  timezone: "Europe/Madrid";
  currency: "EUR";
  slotIntervalMinutes: number;
  privateLessonDuration: number;
  noShowBillable: boolean;
  academyContact: { phone: string; email: string; location: string };
};

export type DemoData = {
  teachers: Teacher[];
  products: Product[];
  activities: Activity[];
  students: Student[];
  bookings: Booking[];
  payments: MockPayment[];
  compensationLines: CompensationLine[];
  invoices: TeacherInvoice[];
  settings: DemoSettings;
};
