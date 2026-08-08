import {
  CheckIcon as Check,
  CreditCardIcon as CreditCard,
  CircleNotchIcon as LoaderCircle,
  ShieldCheckIcon as ShieldCheck,
  WalletIcon as WalletCards,
} from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/cn";
import type { BookingDraft } from "./types";

export function PaymentStep({
  draft,
  onChange,
  onConfirm,
  submitting,
  error,
}: {
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
  onConfirm: () => void;
  submitting: boolean;
  error?: string;
}) {
  const onlineOnly = draft.mode === "group_activity";
  const options = [
    {
      value: "online" as const,
      title: "Pagar online",
      text: "Confirmación inmediata",
      icon: <CreditCard />,
    },
    ...(!onlineOnly
      ? [
          {
            value: "in_person" as const,
            title: "Pagar en persona",
            text: "Quedará pendiente de cobro",
            icon: <WalletCards />,
          },
        ]
      : []),
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
          Pago
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Confirma tu reserva
        </h2>
        <p className="mt-1 text-sm text-muted">
          Elige cómo quieres completar tu reserva.
        </p>
      </div>
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange({ paymentMethod: option.value })}
            className={cn(
              "relative flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition",
              draft.paymentMethod === option.value
                ? "border-forest ring-3 ring-forest/10"
                : "border-line hover:border-forest/30",
            )}
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-xl",
                draft.paymentMethod === option.value
                  ? "bg-forest text-white"
                  : "bg-sand text-muted",
              )}
            >
              {option.icon}
            </span>
            <span>
              <strong className="block">{option.title}</strong>
              <span className="text-sm text-muted">{option.text}</span>
            </span>
            {draft.paymentMethod === option.value ? (
              <Check className="absolute top-4 right-4 text-forest" size={18} />
            ) : null}
          </button>
        ))}
      </div>
      {draft.paymentMethod === "online" ? (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="col-span-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck size={15} /> Pago protegido
          </div>
          <div className="col-span-2 rounded-xl bg-sand px-3 py-3 text-sm tracking-[.16em] text-muted">
            4242 4242 4242 4242
          </div>
          <div className="rounded-xl bg-sand px-3 py-3 text-sm text-muted">
            12 / 30
          </div>
          <div className="rounded-xl bg-sand px-3 py-3 text-sm text-muted">
            123
          </div>
        </div>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
      <Button
        onClick={onConfirm}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Check size={17} />
        )}{" "}
        {submitting
          ? "Confirmando…"
          : draft.paymentMethod === "online"
            ? "Confirmar y pagar"
            : "Confirmar y pagar en persona"}
      </Button>
    </div>
  );
}
