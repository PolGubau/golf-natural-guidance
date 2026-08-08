import {
  ArrowUpRight,
  CalendarCheck2,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  UsersRound,
} from "lucide-react";
import type { DemoData } from "~/domain/models";
import { localDateKey } from "~/lib/dates";
import { formatDate, formatMoney, formatTime, initials } from "~/lib/format";
import type { AdminSection } from "../admin-shell";

export function DashboardView({
  data,
  onNavigate,
}: {
  data: DemoData;
  onNavigate: (section: AdminSection) => void;
}) {
  const today = localDateKey(new Date());
  const upcoming = data.bookings
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        booking.startsAt.slice(0, 10) >= today,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const collected = data.payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount, 0);
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
            label="Cobrado (mock)"
            value={formatMoney(collected)}
            note="Pagos online"
          />
          <Metric
            icon={<GraduationCap />}
            label="Profesores activos"
            value={String(
              data.teachers.filter((teacher) => teacher.active).length,
            )}
            note={`${data.teachers.length} configurados`}
          />
          <Metric
            icon={<UsersRound />}
            label="Clientes"
            value={String(data.students.length)}
            note="Perfiles locales"
          />
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
        <section className="surface rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Próximas en agenda</h2>
              <p className="mt-1 text-xs text-muted">
                Clases y actividades confirmadas
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("agenda")}
              className="flex items-center gap-1 text-xs font-semibold text-forest"
            >
              Ver agenda <ArrowUpRight size={14} />
            </button>
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
          <button
            type="button"
            onClick={() => onNavigate("billing")}
            className="mt-5 flex min-h-10 w-full items-center justify-center rounded-xl bg-forest text-sm font-semibold text-white"
          >
            Ir a facturación
          </button>
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
      <section className="rounded-[22px] bg-forest p-6 text-white sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
            Siguiente sesión
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            {upcoming[0]
              ? formatDate(upcoming[0].startsAt, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Sin reservas próximas"}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {upcoming[0]
              ? `${formatTime(upcoming[0].startsAt)} · ${data.teachers.find((item) => item.id === upcoming[0].teacherId)?.name}`
              : "La agenda está despejada"}
          </p>
        </div>
        <CalendarCheck2 className="mt-5 text-white/25 sm:mt-0" size={54} />
      </section>
    </div>
  );
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
