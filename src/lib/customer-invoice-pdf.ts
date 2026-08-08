import type { CustomerInvoice } from "~/domain/models";

type PdfLogo = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

export async function downloadCustomerInvoicePdf(invoice: CustomerInvoice) {
  const logo = await loadLogoForPdf();
  const blob = new Blob([buildCustomerInvoicePdf(invoice, logo)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `factura-${invoice.number.toLowerCase()}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildCustomerInvoicePdf(
  invoice: CustomerInvoice,
  logo?: PdfLogo,
) {
  const content = buildInvoicePage(invoice, Boolean(logo));
  const pageResources = logo ? "/XObject << /Im1 7 0 R >>" : "";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${pageResources} >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ];
  if (logo) {
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logo.bytes.length * 2 + 1} >>\nstream\n${toHex(logo.bytes)}>\nendstream`,
    );
  }
  const header = `%PDF-1.4\n% GNG invoice\n%% FACTURA ${pdfText(invoice.number)}\n%% TOTAL: ${formatAmount(invoice.total)}\n`;
  let pdf = header;
  const offsets: number[] = [];

  for (const [index, object] of objects.entries()) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function buildInvoicePage(invoice: CustomerInvoice, hasLogo: boolean) {
  const navy = "0.09 0.18 0.14";
  const forest = "0.16 0.31 0.22";
  const coral = "0.88 0.42 0.27";
  const sand = "0.96 0.94 0.89";
  const muted = "0.35 0.40 0.37";
  const lightLine = "0.86 0.87 0.83";
  const commands: string[] = [
    "q",
    "1 1 1 rg",
    "0 0 595 842 re f",
    `${navy} rg 0 742 595 100 re f`,
    `${coral} rg 0 738 595 4 re f`,
    "Q",
  ];

  if (hasLogo) {
    commands.push("q 68 0 0 68 46 764 cm /Im1 Do Q");
  }
  addText(
    commands,
    "GOLF NATURAL GUIDANCE",
    hasLogo ? 128 : 46,
    804,
    hasLogo ? 14 : 16,
    "F2",
    "1 1 1",
  );
  addText(
    commands,
    "ACADEMIA DE GOLF · MALLORCA",
    hasLogo ? 128 : 46,
    784,
    8,
    "F1",
    "0.78 0.84 0.78",
  );
  addText(commands, "FACTURA", 406, 806, 9, "F2", "0.78 0.84 0.78");
  addText(
    commands,
    invoice.number,
    404,
    782,
    invoice.number.length > 20 ? 9 : 10,
    "F2",
    "1 1 1",
  );

  addText(commands, "Fecha de emision", 46, 704, 8, "F2", muted);
  addText(commands, formatDate(invoice.issuedAt), 46, 688, 11, "F1", navy);
  addText(commands, "Estado", 406, 704, 8, "F2", muted);
  addText(commands, "EMITIDA", 406, 688, 10, "F2", forest);

  addText(commands, "EMISOR", 46, 640, 8, "F2", coral);
  addText(commands, invoice.issuer.name, 46, 620, 12, "F2", navy);
  addText(
    commands,
    `NIF/CIF  ${invoice.issuer.taxId}`,
    46,
    603,
    9,
    "F1",
    muted,
  );
  addText(commands, invoice.issuer.address, 46, 587, 9, "F1", muted);

  addText(commands, "FACTURADO A", 310, 640, 8, "F2", coral);
  addText(commands, invoice.recipient.name, 310, 620, 12, "F2", navy);
  addText(
    commands,
    `NIF/CIF  ${invoice.recipient.taxId}`,
    310,
    603,
    9,
    "F1",
    muted,
  );
  addText(commands, invoice.recipient.address, 310, 587, 9, "F1", muted);

  commands.push(`${lightLine} RG 46 550 m 549 550 l S`);
  commands.push(`${sand} rg 46 504 503 42 re f`);
  addText(commands, "CONCEPTO", 58, 526, 8, "F2", muted);
  addText(commands, "IMPORTE", 455, 526, 8, "F2", muted);
  addText(commands, invoice.serviceName, 58, 518 - 18, 11, "F2", navy);
  addText(commands, "Servicio de academia de golf", 58, 482, 8, "F1", muted);
  addText(commands, formatAmount(invoice.subtotal), 455, 500, 10, "F2", navy);
  commands.push(`${lightLine} RG 46 458 m 549 458 l S`);

  addText(commands, "Resumen", 326, 410, 11, "F2", navy);
  addText(commands, "Base imponible", 326, 384, 9, "F1", muted);
  addText(commands, formatAmount(invoice.subtotal), 455, 384, 9, "F1", navy);
  addText(commands, `IVA (${invoice.vatRate}%)`, 326, 364, 9, "F1", muted);
  addText(commands, formatAmount(invoice.vatAmount), 455, 364, 9, "F1", navy);
  commands.push(`${forest} rg 314 318 235 30 re f`);
  addText(commands, "TOTAL", 328, 329, 9, "F2", "1 1 1");
  addText(commands, formatAmount(invoice.total), 438, 329, 12, "F2", "1 1 1");

  addText(commands, "Detalle de la operacion", 46, 410, 11, "F2", navy);
  addText(
    commands,
    `Reserva vinculada  ${invoice.bookingId.slice(-12)}`,
    46,
    384,
    9,
    "F1",
    muted,
  );
  addText(
    commands,
    "Pago y reserva gestionados desde el portal online.",
    46,
    364,
    9,
    "F1",
    muted,
  );
  addText(
    commands,
    "Gracias por confiar en Natural Guidance.",
    46,
    344,
    9,
    "F1",
    muted,
  );

  commands.push(`${lightLine} RG 46 166 m 549 166 l S`);
  addText(commands, "INFORMACION", 46, 142, 8, "F2", coral);
  addText(
    commands,
    "Documento generado desde la demo local de Golf Natural Guidance.",
    46,
    124,
    8,
    "F1",
    muted,
  );
  addText(
    commands,
    "Los datos fiscales y el formato contable deberán validarse antes de producción.",
    46,
    109,
    8,
    "F1",
    muted,
  );
  addText(commands, "golfnaturalguidance.com", 46, 72, 9, "F2", forest);
  addText(commands, "Documento de pago · EUR", 430, 72, 8, "F1", muted);
  commands.push("q", `${coral} rg 46 58 32 3 re f`, "Q");
  return commands.join("\n");
}

function addText(
  commands: string[],
  value: string,
  x: number,
  y: number,
  size: number,
  font: "F1" | "F2",
  color: string,
) {
  commands.push(
    `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`,
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES").format(new Date(value));
}

function formatAmount(value: number) {
  return `${value.toFixed(2)} EUR`;
}

async function loadLogoForPdf(): Promise<PdfLogo | undefined> {
  if (typeof window === "undefined") return undefined;
  try {
    const response = await fetch("/logo-natural-guidance.png");
    if (!response.ok) return undefined;
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 180;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!jpeg) return undefined;
    return {
      bytes: new Uint8Array(await jpeg.arrayBuffer()),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return undefined;
  }
}

function toHex(bytes: Uint8Array) {
  let result = "";
  for (const byte of bytes) result += byte.toString(16).padStart(2, "0");
  return result;
}

function pdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}
