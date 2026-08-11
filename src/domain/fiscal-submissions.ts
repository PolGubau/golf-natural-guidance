import type { CustomerInvoice, FiscalSubmission } from "./models";

export function createFiscalSubmission(
  invoice: CustomerInvoice,
): FiscalSubmission {
  const suffix = invoice.id.slice(-8).toUpperCase();
  return {
    id: `fiscal-${invoice.id}`,
    customerInvoiceId: invoice.id,
    status: "pending",
    recordReference: `VF-${invoice.number}-${suffix}`,
    qrReference: `https://verifactu.demo/registro/${suffix}`,
  };
}
