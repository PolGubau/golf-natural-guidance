import {
  CheckCircleIcon as CheckCircle,
  CircleNotchIcon as LoaderCircle,
  LockKeyIcon as LockKey,
} from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";

export function ClientAccessStep({
  onGoogle,
  pending,
  error,
}: {
  onGoogle: () => void;
  pending: boolean;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-4 sm:py-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-forest text-white">
        <LockKey size={22} />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-coral">
        Acceso de cliente
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Guarda tus datos para la próxima vez
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Tu experiencia y horario ya están seleccionados. Accede ahora para
        recuperar tus datos y asociar la reserva a tu cuenta.
      </p>
      <Button
        size="lg"
        variant="secondary"
        className="mt-7 w-full"
        onClick={onGoogle}
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-bold text-[#4285f4] shadow-xs">
            G
          </span>
        )}
        {pending ? "Conectando…" : "Continuar con Google"}
      </Button>
      {error ? (
        <p
          className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted">
        <CheckCircle className="mt-0.5 shrink-0 text-forest" size={16} />
        En esta demo el acceso de Google está simulado con un perfil local. La
        integración real podrá sustituir este proveedor sin cambiar la reserva.
      </div>
    </div>
  );
}
