import { CalendarDays, Check, Clock3, MapPin } from "lucide-react";
import { getAvailableSlots } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { cn } from "~/lib/cn";
import { localDateKey, upcomingDays } from "~/lib/dates";
import { formatDate, formatTime } from "~/lib/format";
import type { BookingDraft } from "./types";

export function ScheduleStep({
  data,
  draft,
  onChange,
}: {
  data: DemoData;
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}) {
  if (draft.mode === "group_activity") {
    const activity = data.activities.find(
      (item) => item.id === draft.activityId,
    );
    const teacher = data.teachers.find((item) => item.id === draft.teacherId);
    if (!activity) return null;
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
          Tu actividad
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Todo listo en agenda
        </h2>
        <div className="mt-6 overflow-hidden rounded-[24px] bg-forest text-white">
          <div className="h-2" style={{ backgroundColor: activity.color }} />
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <span className="text-sm text-white/60">Actividad</span>
              <h3 className="mt-1 text-xl font-semibold">{activity.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {activity.description}
              </p>
            </div>
            <div className="grid gap-3 text-sm">
              <span className="flex items-center gap-3">
                <CalendarDays className="text-coral" />
                {formatDate(activity.startsAt, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="flex items-center gap-3">
                <Clock3 className="text-coral" />
                {formatTime(activity.startsAt)}–{formatTime(activity.endsAt)}
              </span>
              <span className="flex items-center gap-3">
                <MapPin className="text-coral" />
                Golf Son Muntaner
              </span>
              <span className="flex items-center gap-3">
                <Check className="text-coral" />
                Con {teacher?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const days = upcomingDays(8);
  const date = draft.date || localDateKey(days[0]);
  const slots = draft.teacherId
    ? getAvailableSlots(data, draft.teacherId, date)
    : [];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
        Fecha y hora
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Encuentra tu mejor momento
      </h2>
      <p className="mt-1 text-sm text-muted">
        Las clases duran 50 minutos. Dejamos 10 minutos entre sesiones.
      </p>
      <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const key = localDateKey(day);
          return (
            <button
              type="button"
              key={key}
              onClick={() => onChange({ date: key, startsAt: "", endsAt: "" })}
              className={cn(
                "min-w-20 rounded-2xl border px-3 py-3 text-center transition",
                date === key
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white hover:border-forest/30",
              )}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-65">
                {new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(
                  day,
                )}
              </span>
              <strong className="mt-1 block text-lg">{day.getDate()}</strong>
              <span className="block text-xs opacity-65">
                {new Intl.DateTimeFormat("es-ES", { month: "short" }).format(
                  day,
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock3 size={16} />
          Horas disponibles
        </h3>
        {slots.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.startsAt}
                disabled={!slot.available}
                onClick={() =>
                  onChange({
                    date,
                    startsAt: slot.startsAt,
                    endsAt: slot.endsAt,
                  })
                }
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-semibold transition",
                  draft.startsAt === slot.startsAt
                    ? "border-forest bg-forest text-white"
                    : slot.available
                      ? "border-line bg-white hover:border-forest/30"
                      : "cursor-not-allowed border-transparent bg-sand text-muted/45 line-through",
                )}
              >
                {slot.startsAt.slice(11, 16)}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-sand p-6 text-center text-sm text-muted">
            El profesor no tiene disponibilidad este día. Prueba otra fecha.
          </div>
        )}
      </div>
    </div>
  );
}
