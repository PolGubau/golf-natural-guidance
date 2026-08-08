import {
  ArrowUpRightIcon as ArrowUpRight,
  CalendarCheckIcon as CalendarCheck2,
  CurrencyCircleDollarIcon as CircleDollarSign,
  ClockIcon as Clock3,
  GraduationCapIcon as GraduationCap,
  UsersThreeIcon as UsersRound,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  PerformanceOverview,
  RevenueECharts,
} from "~/components/ui/admin-charts";
import { getBusinessInsights } from "~/domain/analytics";
import type { DemoData } from "~/domain/models";
import { localDateKey } from "~/lib/dates";
import { formatMoney, formatTime, initials } from "~/lib/format";

export function DashboardView({ data }: { data: DemoData }) {
  const today = localDateKey(new Date());
  const insights = getBusinessInsights(data);
  const upcoming = data.bookings
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        booking.startsAt.slice(0, 10) >= today,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pendingCompensation = data.compensationLines
    .filter((line) => line.status === "pending")
    .reduce((total, line) => total + line.amount, 0);
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted">Visión operativa de la academia</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<CalendarCheck2 />}
            label="Próximas reservas"
            value={String(upcoming.length)}
            note={`${upcoming.filter((item) => item.startsAt.startsWith(today)).length} para hoy`}
          />
          <Metric
            icon={<CircleDollarSign />}
            label="Cobrado"
            value={formatMoney(insights.collectedRevenue)}
            note="Pagos registrados"
          />
          <Metric
            icon={<GraduationCap />}
            label="Pendiente de cobro"
            value={formatMoney(insights.pendingRevenue)}
            note="Reservas confirmadas"
          />
          <Metric
            icon={<UsersRound />}
            label="Reservas confirmadas"
            value={String(insights.confirmedBookings)}
            note={`${data.students.length} clientes registrados`}
          />
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(290px,.75fr)]">
        <RevenueECharts data={insights.revenueByMonth} />
        <section className="surface rounded-[22px] p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">
            Salud del negocio
          </p>
          <h2 className="mt-2 font-semibold">Indicadores clave</h2>
          <div className="mt-5 space-y-4">
            <HealthMetric
              label="Asistencia"
              value={formatPercentage(insights.attendanceRate)}
              description="Sesiones completadas sobre cerradas"
              tone="bg-forest"
            />
            <HealthMetric
              label="Cancelaciones"
              value={formatPercentage(insights.cancellationRate)}
              description="Sobre el total de reservas"
              tone="bg-coral"
            />
            <HealthMetric
              label="Ticket medio"
              value={
                insights.averageTicket === null
                  ? "—"
                  : formatMoney(insights.averageTicket)
              }
              description="Media de los cobros realizados"
              tone="bg-[#d5a84b]"
            />
            <HealthMetric
              label="Clientes recurrentes"
              value={formatPercentage(insights.repeatCustomerRate)}
              description="Clientes con dos o más reservas"
              tone="bg-[#527d9f]"
            />
          </div>
        </section>
      </section>
      <PerformanceOverview
        sections={[
          {
            id: "services",
            label: "Servicios",
            description: "Ingresos cobrados por servicio",
            empty: "Aún no hay cobros por servicio.",
            items: insights.services.slice(0, 3).map((service) => ({
              label: service.name,
              value: service.revenue,
              displayValue: formatMoney(service.revenue),
              detail: `${service.bookings} reserva${service.bookings !== 1 ? "s" : ""}`,
              color: "#183e32",
            })),
          },
          {
            id: "teachers",
            label: "Profesores",
            description: "Ingresos cobrados y reservas realizadas",
            empty: "Aún no hay actividad facturada.",
            items: insights.teachers.slice(0, 3).map((teacher) => ({
              label: teacher.name,
              value: teacher.revenue,
              displayValue: formatMoney(teacher.revenue),
              detail: `${teacher.bookings} reserva${teacher.bookings !== 1 ? "s" : ""}`,
              color: teacher.color,
            })),
          },
          {
            id: "activities",
            label: "Aforo",
            description: "Plazas reservadas en próximas actividades",
            empty: "No hay actividades próximas configuradas.",
            percentage: true,
            items: insights.activities.slice(0, 3).map((activity) => ({
              label: activity.name,
              value: activity.occupancyRate,
              displayValue: formatPercentage(activity.occupancyRate),
              detail: `${activity.bookedSeats} de ${activity.capacity} plazas`,
              color: activity.color,
            })),
          },
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
        <section className="surface rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Próximas en agenda</h2>
              <p className="mt-1 text-xs text-muted">
                Clases y actividades confirmadas
              </p>
            </div>
            <Link
              href="/admin/agenda"
              className="flex items-center gap-1 text-xs font-semibold text-forest"
            >
              Ver agenda <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-line">
            {upcoming.slice(0, 5).map((booking) => {
              const student = data.students.find(
                (item) => item.id === booking.studentId,
              );
              const teacher = data.teachers.find(
                (item) => item.id === booking.teacherId,
              );
              const activity = data.activities.find(
                (item) => item.id === booking.activityId,
              );
              return (
                <div
                  key={booking.id}
                  className="grid grid-cols-[52px_1fr_auto] items-center gap-3 py-3"
                >
                  <div className="rounded-xl bg-sand py-2 text-center">
                    <strong className="block text-sm">
                      {new Date(booking.startsAt).getDate()}
                    </strong>
                    <span className="block text-[9px] uppercase text-muted">
                      {new Intl.DateTimeFormat("es-ES", {
                        month: "short",
                      }).format(new Date(booking.startsAt))}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">
                      {activity?.name ?? "Clase privada"} · {student?.name}
                    </strong>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Clock3 size={12} />
                      {formatTime(booking.startsAt)} · {teacher?.name}
                    </span>
                  </div>
                  <strong className="text-sm">
                    {formatMoney(booking.customerPrice)}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="surface rounded-[22px] p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">
            Pendiente de facturar
          </p>
          <strong className="mt-3 block text-3xl tracking-tight">
            {formatMoney(pendingCompensation)}
          </strong>
          <p className="mt-2 text-sm leading-6 text-muted">
            {
              data.compensationLines.filter((line) => line.status === "pending")
                .length
            }{" "}
            líneas de compensación listas para agrupar.
          </p>
          <Link
            href="/admin/facturacion"
            className="mt-5 flex min-h-10 w-full items-center justify-center rounded-xl bg-forest text-sm font-semibold text-white"
          >
            Ir a facturación
          </Link>
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-xs font-semibold">Equipo disponible</p>
            <div className="mt-3 flex -space-x-2">
              {data.teachers
                .filter((teacher) => teacher.active)
                .map((teacher) => (
                  <span
                    key={teacher.id}
                    title={teacher.name}
                    className="grid size-9 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                    style={{ backgroundColor: teacher.color }}
                  >
                    {initials(teacher.name)}
                  </span>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthMetric({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: string;
}) {
  return (
    <div className="grid grid-cols-[10px_1fr_auto] items-center gap-3">
      <span className={`h-9 rounded-full ${tone}`} aria-hidden="true" />
      <span>
        <strong className="block text-sm">{label}</strong>
        <span className="block text-xs text-muted">{description}</span>
      </span>
      <strong className="text-sm">{value}</strong>
    </div>
  );
}

function formatPercentage(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function Metric({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="surface rounded-[20px] p-4">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-sand text-forest">
          {icon}
        </span>
        <ArrowUpRight className="text-muted/40" size={16} />
      </div>
      <strong className="mt-5 block text-2xl tracking-tight">{value}</strong>
      <span className="mt-1 block text-xs font-medium text-muted">{label}</span>
      <span className="mt-3 block text-[10px] text-muted/70">{note}</span>
    </article>
  );
}
