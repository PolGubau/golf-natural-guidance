export type TeacherCategory = "teacher" | "head_teacher" | "master_teacher";

export const teacherCategoryCustomerPrices: Record<TeacherCategory, number> = {
  teacher: 85,
  head_teacher: 85,
  master_teacher: 150,
};
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
  email?: string;
  phone?: string;
  fiscalName: string;
  fiscalId: string;
  fiscalAddress: string;
  invoiceSeries: string;
  publicRole: string;
  category: TeacherCategory;
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
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  fiscalId: string;
  fiscalAddress: string;
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

export type CustomerInvoice = {
  id: string;
  number: string;
  bookingId: string;
  teacherId: string;
  studentId: string;
  issuer: {
    name: string;
    taxId: string;
    address: string;
  };
  recipient: {
    name: string;
    taxId: string;
    address: string;
  };
  serviceName: string;
  issuedAt: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  delivery: {
    status: "sent" | "needs_recipient";
    toEmail?: string;
    sentAt?: string;
  };
};

export type DemoSettings = {
  timezone: "Europe/Madrid";
  currency: "EUR";
  slotIntervalMinutes: number;
  privateLessonDuration: number;
  noShowBillable: boolean;
  academyContact: {
    phone: string;
    email: string;
    website: string;
    location: string;
  };
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
  customerInvoices: CustomerInvoice[];
  settings: DemoSettings;
};
