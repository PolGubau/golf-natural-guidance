import { makeId, round } from "./billing";
import type {
  Activity,
  Booking,
  CustomerInvoice,
  DemoData,
  Student,
  Teacher,
} from "./models";

const vatRate = 21;

export function createCustomerInvoice(
  data: DemoData,
  booking: Booking,
  student: Student,
  teacher: Teacher,
  activity: Activity | undefined,
  issuedAt: string,
): CustomerInvoice {
  const subtotal = round(booking.customerPrice / (1 + vatRate / 100));
  const vatAmount = round(booking.customerPrice - subtotal);
  const number = nextInvoiceNumber(data.customerInvoices, teacher);
  const hasRecipient = Boolean(teacher.email);

  return {
    id: makeId("customer-invoice"),
    number,
    bookingId: booking.id,
    teacherId: teacher.id,
    studentId: student.id,
    issuer: {
      name: teacher.fiscalName,
      taxId: teacher.fiscalId,
      address: teacher.fiscalAddress,
    },
    recipient: {
      name: student.name,
      taxId: student.fiscalId,
      address: student.fiscalAddress,
    },
    serviceName: activity?.name ?? "Clase privada de golf",
    issuedAt,
    subtotal,
    vatRate,
    vatAmount,
    total: booking.customerPrice,
    delivery: hasRecipient
      ? { status: "sent", toEmail: teacher.email, sentAt: issuedAt }
      : { status: "needs_recipient" },
  };
}

function nextInvoiceNumber(invoices: CustomerInvoice[], teacher: Teacher) {
  const sequence =
    invoices.filter((invoice) => invoice.teacherId === teacher.id).length + 1;
  return `${teacher.invoiceSeries}-${String(sequence).padStart(4, "0")}`;
}
