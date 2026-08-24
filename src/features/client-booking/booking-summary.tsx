import {
  CalendarDotsIcon as CalendarDays,
  ClockIcon as Clock3,
  MapPinIcon as MapPin,
  UsersThreeIcon as UsersRound,
} from "@phosphor-icons/react";
import Image from "next/image";
import { resolveCustomerPrice } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { formatDate, formatMoney, formatTime } from "~/lib/format";
import type { BookingDraft } from "./types";

export function BookingSummary({
  data,
  draft,
}: {
  data: DemoData;
  draft: BookingDraft;
}) {
  const teacher = data.teachers.find((item) => item.id === draft.teacherId);
  const activity = data.activities.find((item) => item.id === draft.activityId);
  const price = teacher
    ? resolveCustomerPrice(activity, teacher, draft.memberType)
    : 0;
  const atmosphereTeacher =
    teacher ?? data.teachers.find((item) => item.active) ?? data.teachers[0];
  return (
    <aside className="surface overflow-hidden rounded-[26px]">
      <div className="relative min-h-44 overflow-hidden bg-forest p-6 text-white">
        {atmosphereTeacher?.photoUrl ? (
          <Image
            src={atmosphereTeacher.photoUrl}
            alt=""
            fill
            sizes="340px"
            className="scale-110 object-cover opacity-30 blur-[2px]"
          />
        ) : null}
        <div className="absolute inset-0 bg-forest/75" />
        <div className="absolute -top-16 -right-14 size-44 rounded-full border-[28px] border-white/5" />
        <div className="absolute -right-4 -bottom-16 size-36 rounded-full bg-coral/80 blur-sm" />
        <span className="relative text-xs font-bold uppercase tracking-[.16em] text-white/55">
          Tu reserva
        </span>
        <h2 className="relative mt-3 max-w-xs text-2xl font-semibold tracking-tight">
          {activity?.name ??
            (draft.mode === "private_lesson"
              ? "Clase privada"
              : "Empieza eligiendo una experiencia")}
        </h2>
        <p className="relative mt-2 text-sm text-white/65">
          {teacher
            ? `con ${teacher.name}`
            : "Personaliza tu sesión paso a paso"}
        </p>
      </div>
      <div className="space-y-4 p-6">
        <SummaryRow
          icon={<CalendarDays weight="duotone" />}
          label="Fecha"
          value={
            draft.startsAt
              ? formatDate(draft.startsAt, {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })
              : "Por elegir"
          }
        />
        <SummaryRow
          icon={<Clock3 weight="duotone" />}
          label="Hora"
          value={
            draft.startsAt
              ? `${formatTime(draft.startsAt)}–${formatTime(draft.endsAt)}`
              : "Por elegir"
          }
        />
        <SummaryRow
          icon={<UsersRound weight="duotone" />}
          label="Jugadores"
          value={String(draft.playerCount)}
        />
        <SummaryRow
          icon={<MapPin weight="duotone" />}
          label="Lugar"
          value="Campo de golf de ejemplo"
        />
        <div className="border-t border-line pt-4">
          <div className="flex items-end justify-between">
            <span className="text-sm text-muted">Total</span>
            <strong className="text-2xl tracking-tight">
              {price ? formatMoney(price) : "—"}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand text-muted [&>svg]:size-[18px]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] text-muted">{label}</span>
        <strong className="block truncate text-sm">{value}</strong>
      </span>
    </div>
  );
}
