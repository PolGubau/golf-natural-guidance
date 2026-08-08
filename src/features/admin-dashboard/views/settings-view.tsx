"use client";

import {
  Database,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import type { DemoData } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";

export function SettingsView({ data }: { data: DemoData }) {
  const { commit, reset } = useDemo();
  const [confirmReset, setConfirmReset] = useState(false);
  const contact = data.settings.academyContact;
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Configuración básica
      </h2>
      <p className="mt-1 text-sm text-muted">
        Reglas visibles y estado de esta demo local.
      </p>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="surface rounded-[22px] p-5">
          <h3 className="font-semibold">Criterios de facturación</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            Las reservas confirmadas y completadas son facturables. Este
            criterio es provisional.
          </p>
          <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-sand p-4">
            <span>
              <strong className="block text-sm">Facturar no-shows</strong>
              <span className="text-xs text-muted">
                Incluye ausencias en el cierre mensual
              </span>
            </span>
            <input
              type="checkbox"
              checked={data.settings.noShowBillable}
              onChange={(event) =>
                void commit((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    noShowBillable: event.target.checked,
                  },
                }))
              }
              className="size-5 accent-forest"
            />
          </label>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
            <ShieldCheck />
            <div>
              <strong className="block text-sm">Configuración de demo</strong>
              <span className="text-xs">
                No constituye asesoramiento fiscal.
              </span>
            </div>
          </div>
        </section>
        <section className="surface rounded-[22px] p-5">
          <h3 className="font-semibold">Academia</h3>
          <div className="mt-5 space-y-3 text-sm">
            <p className="flex items-center gap-3">
              <Phone className="text-muted" size={17} />
              {contact.phone}
            </p>
            <p className="flex items-center gap-3">
              <Mail className="text-muted" size={17} />
              {contact.email}
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="text-muted" size={17} />
              {contact.location}
            </p>
          </div>
          <div className="mt-5 rounded-xl bg-sand p-3 text-xs text-muted">
            Zona horaria: {data.settings.timezone} · Moneda:{" "}
            {data.settings.currency}
          </div>
        </section>
        <section className="surface rounded-[22px] p-5 xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-sand text-muted">
                <Database size={18} />
              </span>
              <div>
                <h3 className="font-semibold">Almacenamiento local</h3>
                <p className="mt-1 text-xs text-muted">
                  {data.bookings.length} reservas y {data.students.length}{" "}
                  clientes guardados en este navegador.
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RefreshCcw size={16} /> Reiniciar demo
            </Button>
          </div>
        </section>
      </div>
      <Dialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="¿Reiniciar todos los datos?"
        description="Se eliminarán los cambios locales y se restaurará el seed público de la demo."
      >
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Esta acción elimina reservas, clientes, cambios de profesores y
          facturas creadas en este navegador.
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await reset();
              setConfirmReset(false);
            }}
          >
            <RefreshCcw size={16} /> Sí, reiniciar
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
