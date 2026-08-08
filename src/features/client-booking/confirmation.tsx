import {
  ArrowRightIcon as ArrowRight,
  CalendarCheckIcon as CalendarCheck2,
  CheckIcon as Check,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { DemoData } from "~/domain/models";
import { formatDate, formatTime } from "~/lib/format";
import type { BookingDraft } from "./types";

export function Confirmation({
  data,
  draft,
  onRestart,
}: {
  data: DemoData;
  draft: BookingDraft;
  onRestart: () => void;
}) {
  const teacher = data.teachers.find((item) => item.id === draft.teacherId);
  const activity = data.activities.find((item) => item.id === draft.activityId);
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-90px)] max-w-3xl place-items-center px-5 py-12">
      <div className="surface w-full overflow-hidden rounded-[30px] text-center">
        <div className="bg-forest px-6 py-12 text-white">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-white text-forest shadow-xl">
            <Check size={30} weight="bold" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-coral">
            Reserva confirmada
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Nos vemos en el campo
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">
            Tu reserva está confirmada. Ya puedes consultar todos sus detalles.
          </p>
        </div>
        <div className="grid gap-6 p-7 sm:grid-cols-2 sm:text-left">
          <div>
            <span className="text-xs text-muted">Experiencia</span>
            <strong className="mt-1 block text-lg">
              {activity?.name ?? "Clase privada"}
            </strong>
            <p className="mt-1 text-sm text-muted">con {teacher?.name}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Cuándo</span>
            <strong className="mt-1 block text-lg">
              {formatDate(draft.startsAt, { day: "numeric", month: "long" })}
            </strong>
            <p className="mt-1 text-sm text-muted">
              {formatTime(draft.startsAt)}–{formatTime(draft.endsAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 border-t border-line bg-white/55 p-6 sm:flex-row">
          <Button onClick={onRestart} variant="secondary">
            <CalendarCheck2 size={17} /> Hacer otra reserva
          </Button>
          <Link
            href="/admin"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white"
          >
            Ver en backoffice <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
