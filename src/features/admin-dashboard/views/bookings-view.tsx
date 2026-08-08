"use client";

import {
  CalendarXIcon as CalendarX2,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  CreditCardIcon as CreditCard,
  DownloadSimpleIcon as Download,
  ReceiptIcon as Receipt,
  MagnifyingGlassIcon as Search,
  UserCircleIcon as UserCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { updateBookingStatus } from "~/application/manage-demo";
import { Badge } from "~/components/ui/badge";
import { Dialog } from "~/components/ui/dialog";
import { EmptyState } from "~/components/ui/states";
import type { BookingStatus, DemoData } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";
import { downloadCustomerInvoicePdf } from "~/lib/customer-invoice-pdf";
import {
  bookingStatusLabels,
  formatDate,
  formatMoney,
  formatTime,
  paymentLabels,
} from "~/lib/format";

const statusTone: Record<
  BookingStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending: "warning",
  confirmed: "success",
  completed: "info",
  cancelled: "danger",
  no_show: "neutral",
};

export function BookingsView({
  data,
  clientId,
}: {
  data: DemoData;
  clientId?: string;
}) {
  const { commit } = useDemo();
  const router = useRouter();
  const selectedClient = data.students.find(
    (student) => student.id === clientId,
  );
  const selectedClientName = selectedClient?.name ?? "";
  const [query, setQuery] = useState(selectedClientName);
  const [teacher, setTeacher] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    setQuery(selectedClientName);
  }, [selectedClientName]);
  const filtered = [...data.bookings]
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .filter((booking) => {
      const student = data.students.find(
        (item) => item.id === booking.studentId,
      );
      return (
        (!clientId || booking.studentId === clientId) &&
        (teacher === "all" || booking.teacherId === teacher) &&
        (status === "all" || booking.status === status) &&
        (type === "all" || booking.type === type) &&
        (!query || student?.name.toLowerCase().includes(query.toLowerCase()))
      );
    });
  const selectedBooking = data.bookings.find(
    (booking) => booking.id === selectedBookingId,
  );
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {selectedClient
              ? `Reservas de ${selectedClient.name}`
              : "Todas las reservas"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {selectedClient
              ? "Consulta el historial completo de este cliente."
              : "Consulta y actualiza el estado operativo."}
          </p>
          {selectedClient ? (
            <Link
              href="/admin/reservas"
              className="mt-2 inline-flex text-xs font-semibold text-forest hover:underline"
            >
              Quitar filtro de cliente
            </Link>
          ) : null}
        </div>
        <Badge>{filtered.length} resultados</Badge>
      </div>
      <div className="surface mt-5 grid gap-2 rounded-[20px] p-3 sm:grid-cols-[minmax(180px,1fr)_repeat(3,auto)]">
        <label className="relative">
          <Search className="absolute top-3 left-3 text-muted" size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!event.target.value && clientId)
                router.replace("/admin/reservas", { scroll: false });
            }}
            placeholder="Buscar cliente…"
            aria-label="Buscar cliente"
            className="min-h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none focus:ring-3 focus:ring-forest/10"
          />
        </label>
        <Filter value={teacher} onChange={setTeacher} label="Profesor">
          <option value="all">Todos los profesores</option>
          {data.teachers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Filter>
        <Filter value={type} onChange={setType} label="Tipo">
          <option value="all">Todos los tipos</option>
          <option value="private_lesson">Clase privada</option>
          <option value="group_activity">Actividad</option>
        </Filter>
        <Filter value={status} onChange={setStatus} label="Estado">
          <option value="all">Todos los estados</option>
          {Object.entries(bookingStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
      </div>
      {filtered.length ? (
        <div className="surface mt-4 overflow-x-auto rounded-[22px]">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold uppercase tracking-[.12em] text-muted">
                <th className="px-5 py-4">Cliente / servicio</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Profesor</th>
                <th className="px-4 py-4">Pago</th>
                <th className="px-4 py-4">Importe</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => {
                const student = data.students.find(
                  (item) => item.id === booking.studentId,
                );
                const instructor = data.teachers.find(
                  (item) => item.id === booking.teacherId,
                );
                const activity = data.activities.find(
                  (item) => item.id === booking.activityId,
                );
                const invoice = data.customerInvoices.find(
                  (item) => item.bookingId === booking.id,
                );
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-line/80 text-sm last:border-0 hover:bg-white/70"
                  >
                    <td className="px-5 py-4">
                      <strong className="block">{student?.name}</strong>
                      <span className="mt-1 block text-xs text-muted">
                        {activity?.name ?? "Clase privada"} ·{" "}
                        {booking.playerCount} jugador
                        {booking.playerCount > 1 ? "es" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-medium">
                        {formatDate(booking.startsAt, {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="text-xs text-muted">
                        {formatTime(booking.startsAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">{instructor?.name}</td>
                    <td className="px-4 py-4">
                      <Badge
                        tone={
                          booking.paymentStatus === "paid"
                            ? "success"
                            : "warning"
                        }
                      >
                        {paymentLabels[booking.paymentMethod]} ·{" "}
                        {booking.paymentStatus === "paid"
                          ? "Cobrado"
                          : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {formatMoney(booking.customerPrice)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        aria-label={`Estado de la reserva de ${student?.name}`}
                        value={booking.status}
                        onChange={(event) =>
                          void commit((current) =>
                            updateBookingStatus(
                              current,
                              booking.id,
                              event.target.value as BookingStatus,
                            ),
                          )
                        }
                        className={`min-h-9 rounded-lg border-0 px-2.5 text-xs font-semibold outline-none ring-1 ring-inset ring-line ${statusTone[booking.status] === "success" ? "bg-emerald-50 text-emerald-700" : statusTone[booking.status] === "danger" ? "bg-red-50 text-red-700" : "bg-sand text-muted"}`}
                      >
                        {Object.entries(bookingStatusLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {invoice ? (
                          <button
                            type="button"
                            onClick={() => downloadCustomerInvoicePdf(invoice)}
                            aria-label={`Descargar factura ${invoice.number}`}
                            className="rounded-lg px-2.5 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest/8"
                          >
                            <Download size={14} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(booking.id)}
                          className="rounded-lg px-2.5 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest/8"
                        >
                          Abrir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            icon={<CalendarX2 />}
            title="No hay reservas con estos filtros"
            description="Prueba a cambiar la búsqueda, el profesor o el estado."
          />
        </div>
      )}
      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingId(null);
        }}
        title="Detalle de reserva"
        description="La ficha operativa que conecta cliente, agenda, pago y liquidación."
      >
        {selectedBooking ? (
          <BookingDetail data={data} booking={selectedBooking} />
        ) : null}
      </Dialog>
    </div>
  );
}

function BookingDetail({
  data,
  booking,
}: {
  data: DemoData;
  booking: DemoData["bookings"][number];
}) {
  const student = data.students.find((item) => item.id === booking.studentId);
  const teacher = data.teachers.find((item) => item.id === booking.teacherId);
  const activity = data.activities.find(
    (item) => item.id === booking.activityId,
  );
  const compensation = data.compensationLines.find(
    (item) => item.bookingId === booking.id,
  );
  const invoice = data.customerInvoices.find(
    (item) => item.bookingId === booking.id,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-forest p-5 text-white">
        <p className="text-xs text-white/55">
          {activity?.name ?? "Clase privada"}
        </p>
        <h3 className="mt-1 text-xl font-semibold">{student?.name}</h3>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/75">
          <span>
            {formatDate(booking.startsAt, { day: "numeric", month: "long" })}
          </span>
          <span>
            {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
          </span>
          <span>
            {booking.playerCount} jugador{booking.playerCount > 1 ? "es" : ""}
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem
          icon={<UserCircle size={17} />}
          label="Profesor"
          value={teacher?.name ?? "Sin asignar"}
        />
        <DetailItem
          icon={<CheckCircle size={17} />}
          label="Estado"
          value={bookingStatusLabels[booking.status]}
        />
        <DetailItem
          icon={<CreditCard size={17} />}
          label="Pago"
          value={`${paymentLabels[booking.paymentMethod]} · ${booking.paymentStatus === "paid" ? "Cobrado" : "Pendiente"}`}
        />
        <DetailItem
          icon={<Receipt size={17} />}
          label="Compensación"
          value={
            compensation
              ? `${formatMoney(compensation.amount)} · ${compensation.status === "pending" ? "Pendiente" : "Liquidada"}`
              : "No generada"
          }
        />
      </div>
      <div className="rounded-2xl border border-line bg-white/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Factura del cliente</h3>
            <p className="mt-1 text-xs text-muted">
              {invoice
                ? `${invoice.number} · ${invoice.delivery.status === "sent" ? `Enviada a ${invoice.delivery.toEmail}` : "Configura el email fiscal del profesor"}`
                : "La factura no está disponible para esta reserva."}
            </p>
          </div>
          {invoice ? (
            <button
              type="button"
              onClick={() => downloadCustomerInvoicePdf(invoice)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-forest px-3 text-xs font-semibold text-white transition hover:bg-forest-light"
            >
              <Download size={14} /> Descargar PDF
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Trazabilidad</h3>
        <div className="mt-3 space-y-3">
          <TraceItem
            title="Reserva creada"
            detail="Entrada recibida desde el portal de booking."
            done
          />
          <TraceItem
            title="Agenda del profesor"
            detail={`Bloque reservado para ${teacher?.name ?? "el profesor"}.`}
            done
          />
          <TraceItem
            title={
              booking.paymentStatus === "paid"
                ? "Pago confirmado"
                : "Pago pendiente"
            }
            detail={
              booking.paymentStatus === "paid"
                ? "Pago online simulado en la demo."
                : "Se cobrará presencialmente."
            }
            done={booking.paymentStatus === "paid"}
          />
          <TraceItem
            title="Aviso al cliente"
            detail="WhatsApp preparado · integración pendiente."
            done
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <strong className="mt-2 block text-sm">{value}</strong>
    </div>
  );
}

function TraceItem({
  title,
  detail,
  done,
}: {
  title: string;
  detail: string;
  done: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${done ? "bg-forest text-white" : "bg-sand text-muted"}`}
      >
        {done ? <CheckCircle size={14} weight="fill" /> : <Clock size={14} />}
      </span>
      <div>
        <strong className="block text-sm">{title}</strong>
        <p className="mt-0.5 text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-10 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-muted outline-none"
    >
      {children}
    </select>
  );
}
