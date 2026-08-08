import {
  ArrowRightIcon as ArrowRight,
  CalendarDotsIcon as CalendarDays,
  CheckIcon as Check,
  ClockIcon as Clock3,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { availablePlaces } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { cn } from "~/lib/cn";
import {
  categoryLabels,
  formatDate,
  formatMoney,
  formatTime,
} from "~/lib/format";
import type { BookingDraft } from "./types";

type Props = {
  data: DemoData;
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
};

export function ServiceStep({ data, draft, onChange }: Props) {
  const [section, setSection] = useState<
    "private" | "activities" | "junior" | "packages"
  >("private");
  const activeTeachers = data.teachers.filter((teacher) => teacher.active);
  const activities = data.activities.filter(
    (activity) => activity.active && new Date(activity.endsAt) > new Date(),
  );
  const detailsRef = useRef<HTMLElement>(null);
  const selectedTeacher = data.teachers.find(
    (teacher) => teacher.id === draft.teacherId,
  );
  const selectedActivity = activities.find(
    (activity) => activity.id === draft.activityId,
  );
  const visibleActivities = activities.filter((activity) =>
    section === "junior"
      ? activity.name.toLowerCase().includes("junior")
      : section === "activities"
        ? !activity.name.toLowerCase().includes("junior")
        : true,
  );
  const revealDetails = (patch: Partial<BookingDraft>) => {
    onChange(patch);
    requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      detailsRef.current?.focus({ preventScroll: true });
    });
  };
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-coral">
              Reserva online
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Encuentra tu próxima clase
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dinos cuándo te viene bien y te enseñaremos las mejores opciones.
            </p>
          </div>
        </div>
        <nav
          className="scrollbar-none mb-7 flex gap-2 overflow-x-auto pb-1"
          aria-label="Categorías de reserva"
        >
          {(
            [
              ["private", "Clases privadas"],
              ["activities", "Cursos y actividades"],
              ["junior", "Junior Academy"],
              ["packages", "Bonos y programas"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={section === value}
              onClick={() => setSection(value)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                section === value
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white text-muted hover:border-forest/30 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        {section === "private" ? (
          <>
            <div className="mb-3">
              <button
                type="button"
                aria-pressed={draft.discoveryMode === "schedule_first"}
                onClick={() =>
                  revealDetails({
                    discoveryMode: "schedule_first",
                    mode: "private_lesson",
                    productId: "product-private",
                    teacherId: "",
                    activityId: undefined,
                    startsAt: "",
                    endsAt: "",
                  })
                }
                className={cn(
                  "group relative w-full overflow-hidden rounded-[1.5rem] border p-5 text-left transition sm:p-7",
                  draft.discoveryMode === "schedule_first"
                    ? "border-forest bg-forest text-white shadow-xl shadow-forest/10"
                    : "border-forest/15 bg-gradient-to-br from-sand via-white to-white hover:-translate-y-0.5 hover:border-forest/35 hover:shadow-xl",
                )}
              >
                <span className="absolute -right-8 -bottom-14 size-44 rounded-full bg-coral/15 transition group-hover:scale-110" />
                <span className="relative flex items-start justify-between gap-6">
                  <span className="max-w-xl">
                    <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-coral text-white shadow-lg shadow-coral/20">
                      <CalendarDays size={22} weight="bold" />
                    </span>
                    <strong className="block text-lg sm:text-xl">
                      Buscar una hora disponible
                    </strong>
                    <span
                      className={cn(
                        "mt-2 block text-sm leading-6",
                        draft.discoveryMode === "schedule_first"
                          ? "text-white/70"
                          : "text-muted",
                      )}
                    >
                      Elige el día y la hora que te encajan. Después podrás
                      escoger entre los profesores disponibles y ver sus
                      tarifas.
                    </span>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-coral">
                      Empezar por disponibilidad <ArrowRight size={17} />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "hidden size-10 shrink-0 place-items-center rounded-full border sm:grid",
                      draft.discoveryMode === "schedule_first"
                        ? "border-white/20 bg-white/10"
                        : "border-line bg-white",
                    )}
                  >
                    <ArrowRight size={18} />
                  </span>
                </span>
              </button>
            </div>
            <div className="mb-8 grid gap-x-6 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={draft.discoveryMode === "teacher_first"}
                onClick={() =>
                  onChange({
                    discoveryMode: "teacher_first",
                    mode: null,
                    teacherId: "",
                    activityId: undefined,
                    startsAt: "",
                    endsAt: "",
                  })
                }
                className={cn(
                  "border-b py-4 text-left transition hover:border-forest",
                  draft.discoveryMode === "teacher_first"
                    ? "border-forest"
                    : "border-line",
                )}
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <strong className="block">
                      Tengo un profesor en mente
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      Repite con alguien del equipo o compara sus tarifas.
                    </span>
                  </span>
                  <ArrowRight className="shrink-0 text-coral" size={18} />
                </span>
              </button>
              <button
                type="button"
                aria-pressed={draft.discoveryMode === "activity_first"}
                onClick={() =>
                  onChange({
                    discoveryMode: "activity_first",
                    mode: null,
                    teacherId: "",
                    activityId: undefined,
                    startsAt: "",
                    endsAt: "",
                  })
                }
                className={cn(
                  "border-b py-4 text-left transition hover:border-forest",
                  draft.discoveryMode === "activity_first"
                    ? "border-forest"
                    : "border-line",
                )}
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <strong className="block">Quiero una actividad</strong>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      Cursos y experiencias con fecha y plazas definidas.
                    </span>
                  </span>
                  <ArrowRight className="shrink-0 text-coral" size={18} />
                </span>
              </button>
            </div>
          </>
        ) : null}
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-semibold">
              {section === "packages"
                ? "Bonos y programas"
                : section === "junior"
                  ? "Junior Academy"
                  : "Próximas actividades"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {section === "packages"
                ? "Los bonos y programas se podrán configurar desde el backoffice."
                : section === "junior"
                  ? "Programas para jóvenes según edad y nivel."
                  : "Experiencias con fecha, plazas y pago online."}
            </p>
          </div>
          {section !== "packages" ? (
            <span className="hidden text-xs font-medium text-muted sm:block">
              Plazas limitadas
            </span>
          ) : null}
        </div>
        {section === "packages" ? (
          <div className="rounded-2xl border border-dashed border-line bg-sand/30 p-6 text-sm text-muted">
            Aún no hay bonos configurados para reservar online en esta demo.
          </div>
        ) : (
          <div className="mb-2 grid gap-3 sm:grid-cols-2">
            {visibleActivities.map((activity) => {
              const teacher = data.teachers.find(
                (item) => item.id === activity.teacherId,
              );
              const places = availablePlaces(activity, data.bookings);
              return (
                <CatalogCard
                  key={activity.id}
                  title={activity.name}
                  detail={`${formatDate(activity.startsAt, { day: "numeric", month: "short" })} · ${formatTime(activity.startsAt)} · ${places} plazas · ${formatMoney(activity.price)} · ${teacher?.name ?? "Equipo GNG"}`}
                  action={places ? "Ver actividad" : "Completa"}
                  variant="activity"
                  disabled={!places}
                  selected={
                    draft.activityId === activity.id &&
                    draft.mode === "group_activity"
                  }
                  onClick={() =>
                    revealDetails({
                      discoveryMode: "activity_first",
                      mode: "group_activity",
                      productId: "product-group",
                      activityId: activity.id,
                      teacherId: activity.teacherId,
                      startsAt: activity.startsAt,
                      endsAt: activity.endsAt,
                    })
                  }
                />
              );
            })}
            {!visibleActivities.length ? (
              <div className="rounded-2xl border border-dashed border-line bg-sand/30 p-6 text-sm text-muted sm:col-span-2">
                No hay actividades disponibles en esta categoría.
              </div>
            ) : null}
          </div>
        )}
        {draft.discoveryMode === "teacher_first" ? (
          <div className="mb-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Elige tu profesor</h3>
              <span className="text-xs text-muted">50 min · 1–4 jugadores</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeTeachers.map((teacher) => (
                <CatalogCard
                  key={teacher.id}
                  title={teacher.name}
                  detail={`${categoryLabels[teacher.category]} · ${formatMoney(teacher.customerPrice)} por sesión`}
                  action="Elegir"
                  image={teacher.photoUrl}
                  selected={
                    draft.teacherId === teacher.id &&
                    draft.mode === "private_lesson"
                  }
                  onClick={() =>
                    revealDetails({
                      mode: "private_lesson",
                      productId: "product-private",
                      teacherId: teacher.id,
                      activityId: undefined,
                      startsAt: "",
                      endsAt: "",
                    })
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
      {draft.discoveryMode === "schedule_first" ? (
        <section
          ref={detailsRef}
          tabIndex={-1}
          className="scroll-mt-5 outline-none"
          aria-labelledby="schedule-first-title"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-coral">
            Clase privada
          </p>
          <h2
            id="schedule-first-title"
            className="text-xl font-semibold tracking-tight"
          >
            Primero veremos cuándo puedes venir
          </h2>
          <p className="mt-1 text-sm text-muted">
            Después de elegir la hora te mostraremos únicamente los profesores
            disponibles, junto con su tarifa.
          </p>
          <label className="mt-5 grid max-w-xs gap-2 text-sm font-medium">
            Número de jugadores
            <select
              className="min-h-11 rounded-xl border border-line bg-white px-3"
              value={draft.playerCount}
              onChange={(event) =>
                onChange({ playerCount: Number(event.target.value) })
              }
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "jugador" : "jugadores"}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}
      {draft.discoveryMode === "teacher_first" &&
      draft.mode === "private_lesson" &&
      selectedTeacher ? (
        <section
          ref={detailsRef}
          tabIndex={-1}
          className="scroll-mt-5 outline-none"
          aria-labelledby="private-configuration-title"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-coral">
            Profesor seleccionado
          </p>
          <h2
            id="private-configuration-title"
            className="text-xl font-semibold tracking-tight"
          >
            Clase con {selectedTeacher.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {categoryLabels[selectedTeacher.category]} · 50 minutos ·{" "}
            {formatMoney(selectedTeacher.customerPrice)} por sesión
          </p>
          <label className="mt-5 grid max-w-xs gap-2 text-sm font-medium">
            Número de jugadores
            <select
              className="min-h-11 rounded-xl border border-line bg-white px-3"
              value={draft.playerCount}
              onChange={(event) =>
                onChange({ playerCount: Number(event.target.value) })
              }
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "jugador" : "jugadores"}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}
      {draft.mode === "group_activity" && selectedActivity ? (
        <section
          ref={detailsRef}
          tabIndex={-1}
          className="scroll-mt-5 outline-none"
          aria-labelledby="activity-configuration-title"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-coral">
            Selección realizada
          </p>
          <h2
            id="activity-configuration-title"
            className="text-xl font-semibold tracking-tight"
          >
            Completa tu inscripción
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Revisa la actividad y confirma si tienes tarifa de socio.
          </p>
          <div className="relative grid gap-4 rounded-2xl border border-forest/25 bg-forest/[.04] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 pr-6">
                <strong>{selectedActivity.name}</strong>
                <Badge tone="success">
                  {availablePlaces(selectedActivity, data.bookings)} plazas
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {selectedActivity.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-muted">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {formatDate(selectedActivity.startsAt, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 size={14} />
                  {formatTime(selectedActivity.startsAt)}–
                  {formatTime(selectedActivity.endsAt)}
                </span>
                <span>{selectedTeacher?.name}</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <strong className="text-lg">
                {formatMoney(
                  draft.memberType === "arabella_member"
                    ? (selectedActivity.memberPrice ?? selectedActivity.price)
                    : selectedActivity.price,
                )}
              </strong>
              <span className="block text-[11px] text-muted">por persona</span>
            </div>
            <Check className="absolute top-3 right-3 text-forest" size={16} />
          </div>
          <label className="mt-5 grid max-w-xs gap-2 text-sm font-medium">
            ¿Eres socio de Arabella Golf?
            <select
              className="min-h-11 rounded-xl border border-line bg-white px-3"
              value={draft.memberType}
              onChange={(event) =>
                onChange({
                  memberType: event.target.value as BookingDraft["memberType"],
                })
              }
            >
              <option value="unknown">No lo sé</option>
              <option value="arabella_member">Soy socio</option>
              <option value="non_member">No soy socio</option>
            </select>
          </label>
        </section>
      ) : null}
    </div>
  );
}

function CatalogCard({
  title,
  detail,
  action,
  image,
  selected = false,
  disabled = false,
  muted = false,
  variant = "default",
  onClick,
}: {
  title: string;
  detail: string;
  action: string;
  image?: string;
  selected?: boolean;
  disabled?: boolean;
  muted?: boolean;
  variant?: "default" | "activity";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || muted}
      onClick={onClick}
      aria-pressed={muted ? undefined : selected}
      className={cn(
        "group relative min-h-24 overflow-hidden rounded-2xl border bg-white p-4 text-left transition",
        variant === "activity" &&
          "rounded-xl border-0 border-l-4 border-coral/70 bg-sand/35 hover:bg-sand/60 hover:shadow-none",
        selected
          ? "border-forest ring-3 ring-forest/10"
          : "border-line hover:-translate-y-0.5 hover:shadow-lg",
        muted && "cursor-default bg-sand/45",
        disabled && "cursor-not-allowed opacity-55",
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="56px"
          className="absolute right-0 bottom-0 size-20 object-cover opacity-25 transition group-hover:opacity-35"
        />
      ) : null}
      <span className="relative block pr-16">
        <strong className="block text-sm">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-muted">
          {detail}
        </span>
      </span>
      <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-bold text-forest">
        {action} <ArrowRight size={14} />
      </span>
    </button>
  );
}
