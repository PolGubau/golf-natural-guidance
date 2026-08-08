"use client";

import {
  CurrencyCircleDollarIcon as CircleDollarSign,
  DownloadSimpleIcon as Download,
  SealCheckIcon as FileCheck2,
  FileTextIcon as FileText,
  ReceiptIcon as ReceiptText,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/states";
import { generateMonthlyInvoices } from "~/domain/billing";
import type { DemoData, TeacherInvoice } from "~/domain/models";
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
  const pendingForPeriod = pending.filter((line) =>
    data.bookings
      .find((booking) => booking.id === line.bookingId)
      ?.startsAt.startsWith(period),
  );
  const generate = () =>
    void commit((current) => generateMonthlyInvoices(current, period));
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Liquidaciones de profesores
          </h2>
          <p className="mt-1 text-sm text-muted">
            Revisa las clases del periodo y prepara el cierre mensual de cada
            profesor.
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
          <Button onClick={generate} disabled={!pendingForPeriod.length}>
            <FileCheck2 size={16} /> Generar liquidaciones
          </Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <BillingMetric
          label={`Pendiente · ${period}`}
          value={formatMoney(
            pendingForPeriod.reduce((sum, line) => sum + line.amount, 0),
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
      <section className="mt-5 flex flex-col justify-between gap-4 rounded-[22px] border border-forest/15 bg-forest px-5 py-5 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-coral">Cierre de {period}</p>
          <h3 className="mt-1 text-lg font-semibold">
            {pendingForPeriod.length} clases listas para revisar
          </h3>
          <p className="mt-1 text-sm text-white/65">
            Descarga las clases pendientes en formato CSV.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pendingForPeriod.length}
          onClick={() => exportPendingLines(data, pendingForPeriod, period)}
        >
          <Download size={14} /> Exportar
        </Button>
      </section>
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
            const lines = pendingForPeriod.filter(
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
          Liquidaciones generadas
        </button>
      </div>
      {tab === "lines" ? (
        <LinesTable data={data} period={period} />
      ) : (
        <InvoicesTable data={data} period={period} onExport={exportInvoices} />
      )}
    </div>
  );
}

function LinesTable({ data, period }: { data: DemoData; period: string }) {
  const lines = data.compensationLines.filter((line) =>
    data.bookings
      .find((booking) => booking.id === line.bookingId)
      ?.startsAt.startsWith(period),
  );
  return lines.length ? (
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
          {lines.map((line) => {
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
        title="Sin clases facturables para este mes"
        description="Las líneas se crearán automáticamente al confirmar reservas."
      />
    </div>
  );
}

function InvoicesTable({
  data,
  period,
  onExport,
}: {
  data: DemoData;
  period: string;
  onExport: (data: DemoData, invoices: TeacherInvoice[]) => void;
}) {
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string>();
  const invoices = data.invoices.filter((invoice) => invoice.period === period);
  return invoices.length ? (
    <div className="surface mt-3 rounded-[22px] p-4">
      <div className="mb-3 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onExport(data, invoices)}
        >
          <Download size={14} /> Exportar CSV
        </Button>
      </div>
      <div className="grid gap-3">
        {invoices.map((invoice) => {
          const teacher = data.teachers.find(
            (item) => item.id === invoice.teacherId,
          );
          return (
            <article
              key={invoice.id}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <div className="grid items-center gap-3 sm:grid-cols-[1fr_repeat(3,auto)]">
                <div>
                  <strong>{teacher?.name}</strong>
                  <span className="block text-xs text-muted">
                    Disponible para el profesor · {invoice.bookingIds.length}{" "}
                    reservas
                  </span>
                </div>
                <span className="text-sm">{invoice.hours} h</span>
                <strong>{formatMoney(invoice.amount)}</strong>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setExpandedInvoiceId((current) =>
                      current === invoice.id ? undefined : invoice.id,
                    )
                  }
                >
                  {expandedInvoiceId === invoice.id
                    ? "Ocultar clases"
                    : "Ver clases"}
                </Button>
              </div>
              {expandedInvoiceId === invoice.id ? (
                <InvoiceLines data={data} invoice={invoice} />
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="mt-3">
      <EmptyState
        icon={<FileText />}
        title="Aún no hay facturas para este mes"
        description="Genera las facturas del periodo para que queden disponibles en el backoffice de cada profesor."
      />
    </div>
  );
}

function InvoiceLines({
  data,
  invoice,
}: {
  data: DemoData;
  invoice: TeacherInvoice;
}) {
  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Clases incluidas en la factura
      </p>
      <div className="grid gap-2">
        {invoice.lineIds.map((lineId) => {
          const line = data.compensationLines.find(
            (item) => item.id === lineId,
          );
          const booking = data.bookings.find(
            (item) => item.id === line?.bookingId,
          );
          const student = data.students.find(
            (item) => item.id === booking?.studentId,
          );
          const product = data.products.find(
            (item) => item.id === booking?.productId,
          );
          return (
            <div
              key={lineId}
              className="grid gap-1 rounded-xl bg-sand/50 px-3 py-2 text-xs sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3"
            >
              <span>
                <strong className="font-semibold">
                  {student?.name ?? "Cliente"}
                </strong>
                <span className="text-muted">
                  {" "}
                  · {product?.name ?? "Clase"}
                </span>
              </span>
              <span className="text-muted">
                {booking ? formatDate(booking.startsAt) : "Fecha no disponible"}
              </span>
              <strong>{line ? formatMoney(line.amount) : "—"}</strong>
            </div>
          );
        })}
      </div>
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
  icon: ReactNode;
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

function exportInvoices(data: DemoData, invoices: TeacherInvoice[]) {
  const rows = [
    ["id", "periodo", "profesor", "horas", "importe", "estado"],
    ...invoices.map((invoice) => [
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
  link.download = "liquidaciones-gng.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPendingLines(
  data: DemoData,
  lines: DemoData["compensationLines"],
  period: string,
) {
  const rows = [
    ["reserva", "fecha", "profesor", "horas", "tarifa", "importe", "estado"],
    ...lines.map((line) => {
      const booking = data.bookings.find((item) => item.id === line.bookingId);
      return [
        line.bookingId,
        booking?.startsAt ?? "",
        data.teachers.find((item) => item.id === line.teacherId)?.name ?? "",
        String(line.hours),
        String(line.rate),
        String(line.amount),
        line.status,
      ];
    }),
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
  link.download = `liquidaciones-gng-${period}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
