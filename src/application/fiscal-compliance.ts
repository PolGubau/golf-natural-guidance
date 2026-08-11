import { createFiscalSubmission } from "~/domain/fiscal-submissions";
import type { DemoData } from "~/domain/models";

export function simulateFiscalSubmission(
  data: DemoData,
  customerInvoiceId: string,
  submittedAt = new Date().toISOString(),
): DemoData {
  const invoice = data.customerInvoices.find(
    (item) => item.id === customerInvoiceId,
  );
  if (!invoice) return data;
  const submission =
    data.fiscalSubmissions.find(
      (item) => item.customerInvoiceId === customerInvoiceId,
    ) ?? createFiscalSubmission(invoice);
  return {
    ...data,
    fiscalSubmissions: [
      ...data.fiscalSubmissions.filter(
        (item) => item.customerInvoiceId !== customerInvoiceId,
      ),
      { ...submission, status: "accepted", submittedAt },
    ],
  };
}
