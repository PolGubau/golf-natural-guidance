import type { CustomerInvoice, FiscalSubmission } from "~/domain/models";

export interface FiscalComplianceProvider {
  submit(invoice: CustomerInvoice): Promise<FiscalSubmission>;
}
