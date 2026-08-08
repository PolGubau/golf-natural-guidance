"use client";

import { CalendarX2, Search } from "lucide-react";
import { useState } from "react";
import { updateBookingStatus } from "~/application/manage-demo";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/states";
import type { BookingStatus, DemoData } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";
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

export function BookingsView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [query, setQuery] = useState("");
  const [teacher, setTeacher] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const filtered = [...data.bookings]
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .filter((booking) => {
      const student = data.students.find(
        (item) => item.id === booking.studentId,
      );
      return (
        (teacher === "all" || booking.teacherId === teacher) &&
        (status === "all" || booking.status === status) &&
        (type === "all" || booking.type === type) &&
        (!query || student?.name.toLowerCase().includes(query.toLowerCase()))
      );
    });
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Todas las reservas
          </h2>
          <p className="mt-1 text-sm text-muted">
            Consulta y actualiza el estado operativo.
          </p>
        </div>
        <Badge>{filtered.length} resultados</Badge>
      </div>
      <div className="surface mt-5 grid gap-2 rounded-[20px] p-3 sm:grid-cols-[minmax(180px,1fr)_repeat(3,auto)]">
        <label className="relative">
          <Search className="absolute top-3 left-3 text-muted" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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
