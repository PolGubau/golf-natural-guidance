import { AlertCircle, Database, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({
  label = "Preparando tu experiencia",
}: {
  label?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="grid justify-items-center gap-3 text-sm text-muted">
        <LoaderCircle className="animate-spin text-coral" />
        <span>{label}</span>
      </div>
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-line bg-white/55 px-6 py-12 text-center">
      <div className="mb-2 grid size-10 place-items-center rounded-xl bg-sand text-muted">
        {icon ?? <Database size={19} />}
      </div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
export function ErrorState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-sm rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-800">
        <AlertCircle className="mx-auto mb-3" />
        <strong>No hemos podido cargar los datos locales</strong>
        <p className="mt-1 text-sm">
          Recarga la página o reinicia la demo desde este navegador.
        </p>
      </div>
    </div>
  );
}
