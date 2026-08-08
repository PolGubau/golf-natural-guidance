"use client";

import {
  CheckIcon as Check,
  CurrencyCircleDollarIcon as CircleDollarSign,
  DownloadSimpleIcon as Download,
  SealCheckIcon as FileCheck2,
  FileTextIcon as FileText,
  ReceiptIcon as ReceiptText,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/states";
import { generateMonthlyInvoices } from "~/domain/billing";
import type { DemoData } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";
import { monthKey } from "~/lib/dates";
import { formatDate, formatMoney } from "~/lib/format";

export function BillingView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [tab, setTab] = useState<"lines" | "invoices">("lines");
  const [period, setPeriod] = useState(monthKey());
  const pending = data.compensationLines.filter(
    (line) => line.status === "pending",
  );
  const generate = () =>
    void commit((current) => generateMonthlyInvoices(current, period));
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Facturación mock
          </h2>
          <p className="mt-1 text-sm text-muted">
            Compensación operativa; no son documentos fiscales.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            aria-label="Periodo de facturación"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm"
          />
          <Button onClick={generate}>
            <FileCheck2 size={16} /> Generar mes
          </Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <BillingMetric
          label="Pendiente"
          value={formatMoney(
            pending.reduce((sum, line) => sum + line.amount, 0),
          )}
          icon={<ReceiptText />}
        />
        <BillingMetric
          label="Facturas generadas"
          value={String(data.invoices.length)}
          icon={<FileText />}
        />
        <BillingMetric
          label="Total agrupado"
          value={formatMoney(
            data.invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
          )}
          icon={<CircleDollarSign />}
        />
      </div>
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Resumen por profesor</h3>
            <p className="mt-1 text-xs text-muted">
              Lo que queda pendiente de agrupar este mes.
            </p>
          </div>
          <span className="text-xs text-muted">{period}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.teachers.map((teacher) => {
            const lines = pending.filter(
              (line) => line.teacherId === teacher.id,
            );
            const hours = lines.reduce((sum, line) => sum + line.hours, 0);
            const amount = lines.reduce((sum, line) => sum + line.amount, 0);
            return (
              <article key={teacher.id} className="surface rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid size-8 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: teacher.color }}
                    >
                      {teacher.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <strong className="text-sm">{teacher.name}</strong>
                  </div>
                  <span className="text-xs text-muted">
                    {hours.toFixed(2)} h
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-xs text-muted">
                    {lines.length} {lines.length === 1 ? "clase" : "clases"}{" "}
                    pendientes
                  </span>
                  <strong>{formatMoney(amount)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className="mt-5 flex w-fit gap-1 rounded-xl bg-sand p-1">
        <button
          type="button"
          onClick={() => setTab("lines")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === "lines" ? "bg-white shadow-sm" : "text-muted"}`}
        >
          Por reserva
        </button>
        <button
          type="button"
          onClick={() => setTab("invoices")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === "invoices" ? "bg-white shadow-sm" : "text-muted"}`}
        >
          Facturas mensuales
        </button>
      </div>
      {tab === "lines" ? (
        <LinesTable data={data} />
      ) : (
        <InvoicesTable data={data} onExport={exportInvoices} />
      )}
    </div>
  );
}

function LinesTable({ data }: { data: DemoData }) {
  return data.compensationLines.length ? (
    <div className="surface mt-3 overflow-x-auto rounded-[22px]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[10px] uppercase tracking-wider text-muted">
            <th className="px-5 py-4">Profesor / reserva</th>
            <th className="px-4 py-4">Fecha</th>
            <th className="px-4 py-4">Horas</th>
            <th className="px-4 py-4">Tarifa</th>
            <th className="px-4 py-4">Compensación</th>
            <th className="px-4 py-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.compensationLines.map((line) => {
            const teacher = data.teachers.find(
              (item) => item.id === line.teacherId,
            );
            const booking = data.bookings.find(
              (item) => item.id === line.bookingId,
            );
            const student = data.students.find(
              (item) => item.id === booking?.studentId,
            );
            return (
              <tr
                key={line.id}
                className="border-b border-line/70 last:border-0"
              >
                <td className="px-5 py-4">
                  <strong className="block">{teacher?.name}</strong>
                  <span className="text-xs text-muted">
                    {student?.name} · {line.bookingId.slice(-8)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {booking
                    ? formatDate(booking.startsAt, {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-4">{line.hours} h</td>
                <td className="px-4 py-4">{formatMoney(line.rate)}/h</td>
                <td className="px-4 py-4 font-semibold">
                  {formatMoney(line.amount)}
                </td>
                <td className="px-4 py-4">
                  <Badge
                    tone={
                      line.status === "pending"
                        ? "warning"
                        : line.status === "void"
                          ? "danger"
                          : "success"
                    }
                  >
                    {line.status === "pending"
                      ? "Pendiente"
                      : line.status === "void"
                        ? "Anulada"
                        : "Agrupada"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="mt-3">
      <EmptyState
        icon={<ReceiptText />}
        title="Sin líneas de compensación"
        description="Se crearán automáticamente al confirmar reservas."
      />
    </div>
  );
}

function InvoicesTable({
  data,
  onExport,
}: {
  data: DemoData;
  onExport: (data: DemoData) => void;
}) {
  return data.invoices.length ? (
    <div className="surface mt-3 rounded-[22px] p-4">
      <div className="mb-3 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => onExport(data)}>
          <Download size={14} /> Exportar CSV
        </Button>
      </div>
      <div className="grid gap-3">
        {data.invoices.map((invoice) => {
          const teacher = data.teachers.find(
            (item) => item.id === invoice.teacherId,
          );
          return (
            <article
              key={invoice.id}
              className="grid items-center gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_repeat(3,auto)]"
            >
              <div>
                <strong>{teacher?.name}</strong>
                <span className="block text-xs text-muted">
                  {invoice.period} · {invoice.bookingIds.length} reservas
                </span>
              </div>
              <span className="text-sm">{invoice.hours} h</span>
              <strong>{formatMoney(invoice.amount)}</strong>
              <Badge tone="success">
                <Check size={11} className="mr-1" /> Generada
              </Badge>
            </article>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="mt-3">
      <EmptyState
        icon={<FileText />}
        title="Aún no hay facturas mensuales"
        description="Elige un periodo y agrupa las líneas facturables. La acción es idempotente."
      />
    </div>
  );
}

function BillingMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface flex items-center gap-4 rounded-[18px] p-4">
      <span className="grid size-10 place-items-center rounded-xl bg-sand text-forest">
        {icon}
      </span>
      <div>
        <span className="block text-[10px] uppercase tracking-wider text-muted">
          {label}
        </span>
        <strong className="mt-1 block text-lg">{value}</strong>
      </div>
    </div>
  );
}

function exportInvoices(data: DemoData) {
  const rows = [
    ["id", "periodo", "profesor", "horas", "importe", "estado"],
    ...data.invoices.map((invoice) => [
      invoice.id,
      invoice.period,
      data.teachers.find((item) => item.id === invoice.teacherId)?.name ?? "",
      String(invoice.hours),
      String(invoice.amount),
      invoice.status,
    ]),
  ];
  const blob = new Blob(
    [
      rows
        .map((row) =>
          row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
        )
        .join("\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "facturas-gng-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
}
