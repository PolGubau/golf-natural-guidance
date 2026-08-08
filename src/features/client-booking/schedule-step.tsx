import {
  CalendarDotsIcon as CalendarDays,
  CheckIcon as Check,
  ClockIcon as Clock3,
  MapPinIcon as MapPin,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";
import { getAvailableSlots, getAvailableTeacherSlots } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { cn } from "~/lib/cn";
import { localDateKey, upcomingDays } from "~/lib/dates";
import {
  categoryLabels,
  formatDate,
  formatMoney,
  formatTime,
  initials,
} from "~/lib/format";
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
  const teacherOptionsRef = useRef<HTMLElement>(null);
  const hoursRef = useRef<HTMLElement>(null);
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
  const scheduleFirst = draft.discoveryMode === "schedule_first";
  const days = upcomingDays(8);
  const date = draft.date || localDateKey(days[0]);
  const teacherSlots = draft.teacherId
    ? getAvailableSlots(data, draft.teacherId, date)
    : [];
  const sharedSlots = scheduleFirst ? getAvailableTeacherSlots(data, date) : [];
  const slots = scheduleFirst ? sharedSlots : teacherSlots;
  const availableTeachers = scheduleFirst
    ? (sharedSlots.find((slot) => slot.startsAt === draft.startsAt)?.teachers ??
      [])
    : [];
  const selectedTeacher = data.teachers.find(
    (teacher) => teacher.id === draft.teacherId,
  );
  const alternativeTeachers = scheduleFirst
    ? []
    : data.teachers
        .filter((teacher) => teacher.active && teacher.id !== draft.teacherId)
        .map((teacher) => ({
          teacher,
          slots: getAvailableSlots(data, teacher.id, date).filter(
            (slot) => slot.available,
          ),
        }))
        .filter((item) => item.slots.length > 0);
  const hasSelectableSlots = scheduleFirst
    ? sharedSlots.length > 0
    : teacherSlots.some((slot) => slot.available);
  const hasAvailability = (day: Date) => {
    const key = localDateKey(day);
    return getAvailableTeacherSlots(data, key).length > 0;
  };
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
        Fecha y hora
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        {scheduleFirst ? "¿Cuándo puedes venir?" : "Encuentra tu mejor momento"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {scheduleFirst
          ? "Elige una hora y te mostraremos quién puede atenderte."
          : "Las clases duran 50 minutos. Dejamos 10 minutos entre sesiones."}
      </p>
      <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const key = localDateKey(day);
          const available = hasAvailability(day);
          return (
            <button
              type="button"
              key={key}
              disabled={!available}
              aria-label={`${new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "short" }).format(day)}${available ? "" : ", sin disponibilidad"}`}
              onClick={() =>
                onChange({
                  date: key,
                  startsAt: "",
                  endsAt: "",
                  ...(scheduleFirst ? { teacherId: "" } : {}),
                })
              }
              className={cn(
                "min-w-20 rounded-2xl border px-3 py-3 text-center transition",
                date === key
                  ? "border-forest bg-forest text-white"
                  : available
                    ? "border-line bg-white hover:border-forest/30"
                    : "cursor-not-allowed border-line/60 bg-sand/60 text-muted/40",
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
      <section
        ref={hoursRef}
        tabIndex={-1}
        className="mt-6 scroll-mt-5 outline-none"
        aria-labelledby="available-hours-title"
      >
        <h3
          id="available-hours-title"
          className="mb-3 flex items-center gap-2 text-sm font-semibold"
        >
          <Clock3 size={16} />
          Horas disponibles
        </h3>
        {hasSelectableSlots ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.startsAt}
                disabled={"available" in slot && !slot.available}
                onClick={() => {
                  onChange({
                    date,
                    startsAt: slot.startsAt,
                    endsAt: slot.endsAt,
                    ...(scheduleFirst ? { teacherId: "" } : {}),
                  });
                  if (scheduleFirst)
                    requestAnimationFrame(() => {
                      teacherOptionsRef.current?.scrollIntoView({
                        behavior: window.matchMedia(
                          "(prefers-reduced-motion: reduce)",
                        ).matches
                          ? "auto"
                          : "smooth",
                        block: "start",
                      });
                      teacherOptionsRef.current?.focus({
                        preventScroll: true,
                      });
                    });
                }}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-semibold transition",
                  draft.startsAt === slot.startsAt
                    ? "border-forest bg-forest text-white"
                    : !("available" in slot) || slot.available
                      ? "border-line bg-white hover:border-forest/30"
                      : "cursor-not-allowed border-transparent bg-sand text-muted/45 line-through",
                )}
              >
                <span className="block">{slot.startsAt.slice(11, 16)}</span>
                {"teachers" in slot ? (
                  <span className="mt-0.5 block text-[10px] font-medium opacity-65">
                    {slot.teachers.length}{" "}
                    {slot.teachers.length === 1 ? "profe" : "profes"}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="rounded-2xl bg-sand p-6 text-center text-sm text-muted">
              {alternativeTeachers.length
                ? `${selectedTeacher?.name ?? "El profesor elegido"} no tiene disponibilidad este día.`
                : "No hay profesores disponibles este día. Prueba otra fecha."}
            </div>
            {alternativeTeachers.length ? (
              <div className="mt-5">
                <h4 className="font-semibold">
                  Otros profesores disponibles este día
                </h4>
                <p className="mt-1 text-sm text-muted">
                  Puedes cambiar de profesor sin perder la fecha elegida.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {alternativeTeachers.map(({ teacher, slots: options }) => (
                    <button
                      type="button"
                      key={teacher.id}
                      onClick={() => {
                        onChange({
                          teacherId: teacher.id,
                          startsAt: "",
                          endsAt: "",
                        });
                        requestAnimationFrame(() => {
                          hoursRef.current?.scrollIntoView({
                            behavior: window.matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "auto"
                              : "smooth",
                            block: "start",
                          });
                          hoursRef.current?.focus({ preventScroll: true });
                        });
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition hover:border-forest/30 hover:shadow-md"
                    >
                      <span
                        className="size-10 shrink-0 overflow-hidden rounded-full"
                        style={{ backgroundColor: teacher.color }}
                      >
                        {teacher.photoUrl ? (
                          <Image
                            src={teacher.photoUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="grid size-full place-items-center text-xs font-bold text-white">
                            {initials(teacher.name)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {teacher.name}
                        </strong>
                        <span className="block truncate text-xs text-muted">
                          {options.length} horarios · desde{" "}
                          {formatTime(options[0].startsAt)}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-forest">
                        Cambiar
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
      {scheduleFirst && draft.startsAt ? (
        <section
          ref={teacherOptionsRef}
          tabIndex={-1}
          className="mt-8 scroll-mt-5 border-t border-line pt-6 outline-none"
          aria-labelledby="available-teachers-title"
        >
          <h3 id="available-teachers-title" className="text-lg font-semibold">
            Elige tu profesor
          </h3>
          <p className="mt-1 text-sm text-muted">
            Todos están disponibles a las {draft.startsAt.slice(11, 16)}.
            Compara especialidad y tarifa antes de continuar.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[...availableTeachers]
              .sort(
                (a, b) =>
                  a.customerPrice - b.customerPrice ||
                  a.name.localeCompare(b.name),
              )
              .map((teacher) => (
                <button
                  type="button"
                  key={teacher.id}
                  aria-pressed={draft.teacherId === teacher.id}
                  onClick={() => onChange({ teacherId: teacher.id })}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition",
                    draft.teacherId === teacher.id
                      ? "border-forest ring-3 ring-forest/10"
                      : "border-line hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md",
                  )}
                >
                  <span
                    className="size-11 shrink-0 overflow-hidden rounded-full"
                    style={{ backgroundColor: teacher.color }}
                  >
                    {teacher.photoUrl ? (
                      <Image
                        src={teacher.photoUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-xs font-bold text-white">
                        {initials(teacher.name)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {teacher.name}
                    </strong>
                    <span className="block truncate text-xs text-muted">
                      {categoryLabels[teacher.category]}
                    </span>
                  </span>
                  <strong className="text-sm">
                    {formatMoney(teacher.customerPrice)}
                  </strong>
                </button>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
