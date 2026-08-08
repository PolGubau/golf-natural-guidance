import { describe, expect, it } from "vitest";
import { createSeed } from "~/infrastructure/seed";
import { buildCustomerInvoicePdf } from "./customer-invoice-pdf";

describe("customer invoice PDF", () => {
  it("creates a PDF document with the invoice number and totals", () => {
    const invoice = createSeed().customerInvoices[0];
    const document = new TextDecoder().decode(buildCustomerInvoicePdf(invoice));

    expect(document.startsWith("%PDF-1.4")).toBe(true);
    expect(document).toContain(`FACTURA ${invoice.number}`);
    expect(document).toContain("TOTAL:");
  });
});
