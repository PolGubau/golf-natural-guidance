import { ArrowRight, CalendarDays, Check, Clock3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { availablePlaces } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { cn } from "~/lib/cn";
import {
  categoryLabels,
  formatDate,
  formatMoney,
  formatTime,
  initials,
} from "~/lib/format";
import type { BookingDraft } from "./types";

type Props = {
  data: DemoData;
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
};

export function ServiceStep({ data, draft, onChange }: Props) {
  const [filter, setFilter] = useState<
    "all" | "private" | "courses" | "junior" | "packages"
  >("all");
  const activeTeachers = data.teachers.filter((teacher) => teacher.active);
  const activities = data.activities.filter(
    (activity) => activity.active && new Date(activity.endsAt) > new Date(),
  );
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-coral">
              Reserva online
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Encuentra tu próxima experiencia
            </h2>
            <p className="mt-1 text-sm text-muted">
              Elige directamente una clase, un curso o un programa.
            </p>
          </div>
          <Badge>{activeTeachers.length} profesores</Badge>
        </div>
        <div
          className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filtrar experiencias"
        >
          {(
            [
              ["all", "Todo"],
              ["private", "Clases privadas"],
              ["courses", "Cursos"],
              ["junior", "Junior Academy"],
              ["packages", "Bonos y programas"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                filter === value
                  ? "border-forest bg-forest text-white"
                  : "border-line bg-white text-muted hover:border-forest/30 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {filter === "all" || filter === "private" ? (
          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Clases privadas</h3>
              <span className="text-xs text-muted">50 min · 1–4 jugadores</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeTeachers.slice(0, 4).map((teacher) => (
                <CatalogCard
                  key={teacher.id}
                  title={`Clase con ${teacher.name}`}
                  detail={`${categoryLabels[teacher.category]} · ${formatMoney(teacher.customerPrice)} por sesión`}
                  action="Reservar"
                  image={teacher.photoUrl}
                  selected={
                    draft.teacherId === teacher.id &&
                    draft.mode === "private_lesson"
                  }
                  onClick={() =>
                    onChange({
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
        {filter === "all" || filter === "courses" || filter === "junior" ? (
          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Cursos y actividades</h3>
              <span className="text-xs text-muted">
                Plazas limitadas · pago online
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activities.map((activity) => {
                const teacher = data.teachers.find(
                  (item) => item.id === activity.teacherId,
                );
                const places = availablePlaces(activity, data.bookings);
                return (
                  <CatalogCard
                    key={activity.id}
                    title={activity.name}
                    detail={`${places} plazas · ${formatMoney(activity.price)} · ${teacher?.name ?? "Equipo GNG"}`}
                    action={places ? "Apuntarse" : "Completa"}
                    disabled={!places}
                    selected={
                      draft.activityId === activity.id &&
                      draft.mode === "group_activity"
                    }
                    onClick={() =>
                      onChange({
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
            </div>
          </div>
        ) : null}
        {filter === "all" || filter === "packages" ? (
          <div className="mb-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Bonos y programas</h3>
              <span className="text-xs text-muted">
                Compra o solicita información
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <CatalogCard
                title="Bono privado · 10 clases"
                detail="50 min por clase · precio según profesor"
                action="Comprar"
                muted
              />
              <CatalogCard
                title="Profesionaliza"
                detail="Bono de 10 h · desde 600 €"
                action="Comprar"
                muted
              />
            </div>
          </div>
        ) : null}
      </section>
      {draft.mode === "private_lesson" ? (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                ¿Con quién quieres entrenar?
              </h2>
              <p className="mt-1 text-sm text-muted">
                Todos los precios son datos públicos editables de la demo.
              </p>
            </div>
            <Badge>{activeTeachers.length} disponibles</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeTeachers.map((teacher) => (
              <button
                type="button"
                key={teacher.id}
                onClick={() => onChange({ teacherId: teacher.id })}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg",
                  draft.teacherId === teacher.id
                    ? "border-forest ring-3 ring-forest/10"
                    : "border-line",
                )}
              >
                <span
                  className="size-11 shrink-0 overflow-hidden rounded-full bg-sand"
                  style={{ backgroundColor: teacher.color }}
                >
                  {teacher.photoUrl ? (
                    <Image
                      src={teacher.photoUrl}
                      alt={`Foto de ${teacher.name}`}
                      width={44}
                      height={44}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-sm font-bold text-white">
                      {initials(teacher.name)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {teacher.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {categoryLabels[teacher.category]} · {teacher.publicRole}
                  </span>
                </span>
                <span className="text-right">
                  <strong className="block">
                    {formatMoney(teacher.customerPrice)}
                  </strong>
                  <span className="text-[11px] text-muted">por sesión</span>
                </span>
                {draft.teacherId === teacher.id ? (
                  <Check
                    className="absolute top-2 right-2 text-forest"
                    size={15}
                  />
                ) : null}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
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
            <label className="grid gap-2 text-sm font-medium">
              Relación con Arabella
              <select
                className="min-h-11 rounded-xl border border-line bg-white px-3"
                value={draft.memberType}
                onChange={(event) =>
                  onChange({
                    memberType: event.target
                      .value as BookingDraft["memberType"],
                  })
                }
              >
                <option value="unknown">No lo sé</option>
                <option value="arabella_member">Soy socio</option>
                <option value="non_member">No soy socio</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}
      {draft.mode === "group_activity" ? (
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Próximas actividades
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Horarios cerrados, grupos reducidos y pago online.
          </p>
          <div className="grid gap-3">
            {activities.map((activity) => {
              const teacher = data.teachers.find(
                (item) => item.id === activity.teacherId,
              );
              const places = availablePlaces(activity, data.bookings);
              const selected = draft.activityId === activity.id;
              return (
                <button
                  type="button"
                  key={activity.id}
                  disabled={places === 0}
                  onClick={() =>
                    onChange({
                      activityId: activity.id,
                      teacherId: activity.teacherId,
                      startsAt: activity.startsAt,
                      endsAt: activity.endsAt,
                    })
                  }
                  className={cn(
                    "relative grid gap-4 rounded-2xl border bg-white p-4 text-left transition sm:grid-cols-[1fr_auto] sm:items-center",
                    selected
                      ? "border-forest ring-3 ring-forest/10"
                      : "border-line hover:shadow-lg",
                    places === 0 && "opacity-55",
                  )}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{activity.name}</strong>
                      <Badge tone={places <= 2 ? "warning" : "success"}>
                        {places ? `${places} plazas` : "Completa"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {activity.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(activity.startsAt, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={14} />
                        {formatTime(activity.startsAt)}–
                        {formatTime(activity.endsAt)}
                      </span>
                      <span>{teacher?.name}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <strong className="text-lg">
                      {formatMoney(
                        draft.memberType === "arabella_member"
                          ? (activity.memberPrice ?? activity.price)
                          : activity.price,
                      )}
                    </strong>
                    <span className="block text-[11px] text-muted">
                      por persona
                    </span>
                  </div>
                  {selected ? (
                    <Check
                      className="absolute top-3 right-3 text-forest"
                      size={16}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <label className="mt-5 grid max-w-xs gap-2 text-sm font-medium">
            Relación con Arabella
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
  onClick,
}: {
  title: string;
  detail: string;
  action: string;
  image?: string;
  selected?: boolean;
  disabled?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || muted}
      onClick={onClick}
      className={cn(
        "group relative min-h-24 overflow-hidden rounded-2xl border bg-white p-4 text-left transition",
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
