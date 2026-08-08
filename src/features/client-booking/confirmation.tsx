import {
  ArrowRightIcon as ArrowRight,
  CalendarIcon as Calendar,
  CalendarCheckIcon as CalendarCheck2,
  ChatCircleTextIcon as ChatCircleText,
  CheckIcon as Check,
  CreditCardIcon as CreditCard,
  ReceiptIcon as Receipt,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
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
  const booking = [...data.bookings]
    .filter(
      (item) =>
        item.teacherId === draft.teacherId && item.startsAt === draft.startsAt,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const isPaid = booking?.paymentStatus === "paid";
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
        <div className="border-t border-line bg-sand/35 px-7 py-7 text-left">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Todo listo para la academia
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                La reserva ya ha pasado por los pasos que normalmente haría el
                equipo.
              </p>
            </div>
            <Badge tone="success">Registro completado</Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ConnectionStep
              icon={<Calendar size={18} />}
              title="Agenda actualizada"
              detail={`La clase aparece en la agenda de ${teacher?.name ?? "tu profesor"}.`}
            />
            <ConnectionStep
              icon={<CreditCard size={18} />}
              title={isPaid ? "Pago registrado" : "Pago presencial pendiente"}
              detail={
                isPaid
                  ? "El pago online queda registrado y la plaza confirmada."
                  : "La clase se cobrará en la academia, tal como has elegido."
              }
            />
            <ConnectionStep
              icon={<Receipt size={18} />}
              title="Factura generada"
              detail="La factura de la reserva queda disponible para el profesor y el equipo administrativo."
            />
            <ConnectionStep
              icon={<ChatCircleText size={18} />}
              title="Factura enviada al profesor"
              detail="El envío al email fiscal queda registrado para el equipo."
            />
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

function ConnectionStep({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line/80 bg-white/80 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/10 text-forest">
        {icon}
      </span>
      <div>
        <strong className="block text-sm">{title}</strong>
        <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
      </div>
    </div>
  );
}
