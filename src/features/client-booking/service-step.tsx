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
import { type DemoData, teacherCategoryCustomerPrices } from "~/domain/models";
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

type BookingSection = "private" | "activities" | "junior" | "packages";

const bookingSections: ReadonlyArray<{
  value: BookingSection;
  label: string;
  description: string;
  image: string;
}> = [
  {
    value: "private",
    label: "Clases privadas",
    description: "Reserva una sesión a tu medida",
    image: "/golf/private-lessons.jpg",
  },
  {
    value: "activities",
    label: "Cursos y actividades",
    description: "Experiencias con fecha y plazas",
    image: "/golf/team.png",
  },
  {
    value: "junior",
    label: "Junior Academy",
    description: "Programas para jóvenes",
    image: "/golf/junior-academy.jpg",
  },
  {
    value: "packages",
    label: "Bonos y programas",
    description: "Opciones para entrenar con continuidad",
    image: "/golf/programs.jpg",
  },
];

const resetSelection: Partial<BookingDraft> = {
  discoveryMode: null,
  mode: null,
  teacherId: "",
  activityId: undefined,
  startsAt: "",
  endsAt: "",
};

export function ServiceStep({ data, draft, onChange }: Props) {
  const [section, setSection] = useState<BookingSection>("private");
  const activeTeachers = data.teachers.filter((teacher) => teacher.active);
  const activities = data.activities.filter(
    (activity) => activity.active && new Date(activity.endsAt) > new Date(),
  );
  const detailsRef = useRef<HTMLElement>(null);
  const sectionContentRef = useRef<HTMLDivElement>(null);
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
  const selectSection = (next: BookingSection) => {
    setSection(next);
    onChange(resetSelection);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sectionContentRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    });
  };
  const revealDetails = (patch: Partial<BookingDraft>) => {
    onChange(patch);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
        detailsRef.current?.focus({ preventScroll: true });
      });
    });
  };
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-coral">
              Reserva online
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Encuentra tu próxima clase
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dinos cuándo te viene bien y te enseñaremos las mejores opciones.
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex -space-x-2">
              {activeTeachers.slice(0, 4).map((teacher) => (
                <span
                  key={teacher.id}
                  className="relative size-8 overflow-hidden rounded-full border-2 border-white bg-sand"
                  title={teacher.name}
                >
                  {teacher.photoUrl ? (
                    <Image
                      src={teacher.photoUrl}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted">Nuestro equipo</span>
          </div>
        </div>
        <div className="mb-7 border-y border-line py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink">
              ¿Qué quieres reservar?
            </p>
          </div>
          <div
            className="grid gap-3 sm:grid-cols-3"
            aria-label="Categorías de reserva"
            role="tablist"
          >
            {bookingSections.map(
              ({ value, label, description, image }, index) => {
                return (
                  <button
                    type="button"
                    key={value}
                    id={`booking-tab-${value}`}
                    role="tab"
                    aria-selected={section === value}
                    onClick={() => selectSection(value)}
                    className={cn(
                      "group relative isolate min-h-32 overflow-hidden rounded-xl text-left text-white transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60",
                      value === "private" && "sm:col-span-3 sm:min-h-40",
                      section === value
                        ? "shadow-lg shadow-forest/15 ring-2 ring-coral/70"
                        : "shadow-sm hover:shadow-lg hover:shadow-forest/10",
                    )}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes={value === "private" ? "700px" : "350px"}
                        className="absolute inset-0 -z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-forest/95 via-forest/45 to-forest/10" />
                    <span
                      className={cn(
                        "absolute top-4 right-4 grid size-6 place-items-center rounded-full border bg-black/10 backdrop-blur-sm transition-colors duration-200",
                        section === value
                          ? "border-coral bg-coral text-white"
                          : "border-white/60 text-transparent group-hover:border-white group-hover:text-white",
                      )}
                    >
                      <Check size={14} weight="bold" />
                    </span>
                    <span className="absolute right-4 bottom-4 left-4 block">
                      <span className="mb-2 block text-[10px] font-medium tracking-[.08em] text-white/65">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block text-base font-semibold tracking-tight sm:text-lg">
                        {label}
                      </span>
                      <span className="mt-1 block max-w-[34rem] text-xs leading-5 text-white/75">
                        {description}
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
        {section === "private" ? (
          <>
            <div ref={sectionContentRef} className="mb-3 scroll-mt-6">
              <button
                type="button"
                aria-pressed={draft.discoveryMode === "schedule_first"}
                onClick={() =>
                  revealDetails({
                    ...resetSelection,
                    discoveryMode: "schedule_first",
                    mode: "private_lesson",
                    productId: "product-private",
                  })
                }
                className={cn(
                  "group relative w-full overflow-hidden rounded-xl border p-5 text-left transition sm:p-7",
                  draft.discoveryMode === "schedule_first"
                    ? "border-forest bg-forest text-white shadow-md shadow-forest/10"
                    : "border-forest/15 bg-sand hover:border-forest/35 hover:shadow-md",
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
                    ...resetSelection,
                    discoveryMode: "teacher_first",
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
                  (() => {
                    selectSection("activities");
                    onChange({
                      ...resetSelection,
                      discoveryMode: "activity_first",
                    });
                  })()
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
        {section !== "private" ? (
          <div
            ref={sectionContentRef}
            className="mb-3 flex scroll-mt-6 items-end justify-between gap-4"
          >
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
        ) : null}
        {section !== "private" && section === "packages" ? (
          <div className="rounded-2xl border border-dashed border-line bg-sand/30 p-6 text-sm text-muted">
            Aún no hay bonos configurados para reservar online en esta demo.
          </div>
        ) : section !== "private" ? (
          <div className="mb-2 grid gap-3 sm:grid-cols-2">
            {visibleActivities.map((activity) => {
              const teacher = data.teachers.find(
                (item) => item.id === activity.teacherId,
              );
              const places = availablePlaces(activity, data.bookings);
              return (
                <ActivityCard
                  key={activity.id}
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
                  activity={activity}
                  teacherName={teacher?.name ?? "Equipo de la academia"}
                  places={places}
                />
              );
            })}
            {!visibleActivities.length ? (
              <div className="rounded-2xl border border-dashed border-line bg-sand/30 p-6 text-sm text-muted sm:col-span-2">
                No hay actividades disponibles en esta categoría.
              </div>
            ) : null}
          </div>
        ) : null}
        {section === "private" && draft.discoveryMode === "teacher_first" ? (
          <div className="mb-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Elige tu profesor</h3>
              <span className="text-xs text-muted">50 min · 1–4 jugadores</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeTeachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
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
                  teacher={teacher}
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
            {formatMoney(
              teacherCategoryCustomerPrices[selectedTeacher.category],
            )}{" "}
            por sesión
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

function TeacherCard({
  teacher,
  selected,
  onClick,
}: {
  teacher: DemoData["teachers"][number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 border-b py-3 text-left transition hover:border-forest",
        selected ? "border-forest" : "border-line",
      )}
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-sand">
        {teacher.photoUrl ? (
          <Image
            src={teacher.photoUrl}
            alt={`Foto de ${teacher.name}`}
            fill
            sizes="56px"
            className="object-cover grayscale-[15%] transition group-hover:scale-105"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{teacher.name}</strong>
        <span className="mt-1 block truncate text-xs text-muted">
          {categoryLabels[teacher.category]}
        </span>
      </span>
      <span className="text-right">
        <strong className="block text-sm">
          {formatMoney(teacherCategoryCustomerPrices[teacher.category])}
        </strong>
        <span className="text-[11px] text-muted">por sesión</span>
      </span>
      <ArrowRight className="shrink-0 text-coral" size={17} />
    </button>
  );
}

function ActivityCard({
  activity,
  teacherName,
  places,
  selected,
  disabled,
  onClick,
}: {
  activity: DemoData["activities"][number];
  teacherName: string;
  places: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const date = new Date(activity.startsAt);
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "group grid min-h-44 grid-cols-[64px_minmax(0,1fr)] items-start gap-4 rounded-[20px] border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-forest/50 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
        selected
          ? "border-forest bg-forest/[.04] ring-1 ring-forest/20"
          : "border-line",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="rounded-2xl bg-sand px-2 py-3 text-center">
        <span className="block text-[11px] font-bold uppercase tracking-[.12em] text-coral">
          {date
            .toLocaleDateString("es-ES", { weekday: "short" })
            .replace(".", "")}
        </span>
        <strong className="mt-1 block text-2xl font-medium leading-none">
          {date.getDate()}
        </strong>
        <span className="mt-1 block text-[11px] text-muted">
          {date
            .toLocaleDateString("es-ES", { month: "short" })
            .replace(".", "")}
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <strong className="pr-9 text-base leading-5 transition-colors group-hover:text-forest">
          {activity.name}
        </strong>
        <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
          {activity.description}
        </span>
        <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {formatTime(activity.startsAt)}–{formatTime(activity.endsAt)}
          </span>
          <span>Con {teacherName}</span>
        </span>
        <span className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
          <span>
            <strong className="block text-sm text-ink">
              {formatMoney(activity.price)}
            </strong>
            <span className="block text-[11px] text-muted">por persona</span>
          </span>
          <span className="flex items-center gap-2">
            <Badge tone={places ? "success" : "danger"}>
              {places ? `${places} plazas disponibles` : "Plazas completas"}
            </Badge>
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-forest text-white transition-transform group-hover:translate-x-0.5"
            >
              <ArrowRight size={16} />
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
