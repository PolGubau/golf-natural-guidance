"use client";

import {
  ArrowRightIcon as ArrowRight,
  CheckCircleIcon as CheckCircle,
  SparkleIcon as Sparkle,
  UserPlusIcon as UserPlus,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  prepareLeadFollowUp,
  updateLeadStage,
} from "~/application/lead-automation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { DemoData, LeadStage } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";

const stages: { id: LeadStage; label: string }[] = [
  { id: "new", label: "Nuevos" },
  { id: "contacted", label: "Contactados" },
  { id: "qualified", label: "Cualificados" },
  { id: "booking_pending", label: "Pendientes de reserva" },
  { id: "booked", label: "Convertidos" },
];

export function LeadsView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [pendingLeadId, setPendingLeadId] = useState<string>();
  const readyTasks = data.automationTasks.filter(
    (task) => task.status !== "completed",
  ).length;
  const prepareFollowUp = async (leadId: string) => {
    setPendingLeadId(leadId);
    await commit((current) => prepareLeadFollowUp(current, leadId));
    setPendingLeadId(undefined);
  };
  const convertLead = async (leadId: string) => {
    setPendingLeadId(leadId);
    await commit((current) => updateLeadStage(current, leadId, "booked"));
    setPendingLeadId(undefined);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
            Captación conectada
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Oportunidades que pueden jugar más
          </h2>
          <p className="mt-1 text-sm text-muted">
            Convierte el interés de la web y las recomendaciones en reservas.
          </p>
        </div>
        <Badge tone="info">
          {readyTasks} seguimiento{readyTasks !== 1 ? "s" : ""} preparado
          {readyTasks !== 1 ? "s" : ""}
        </Badge>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Leads activos" value={data.leads.length} />
        <Metric
          label="Prioridad alta"
          value={data.leads.filter((lead) => lead.score >= 80).length}
        />
        <Metric
          label="Listos para reservar"
          value={
            data.leads.filter((lead) => lead.stage === "booking_pending").length
          }
        />
      </section>

      <section className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[1060px] grid-cols-5 gap-3">
          {stages.map((stage) => {
            const leads = data.leads.filter((lead) => lead.stage === stage.id);
            return (
              <div key={stage.id} className="rounded-[20px] bg-sand/70 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-[.1em] text-muted">
                    {stage.label}
                  </h3>
                  <Badge>{leads.length}</Badge>
                </div>
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <article
                      key={lead.id}
                      className="rounded-2xl border border-line bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="block text-sm">{lead.name}</strong>
                          <span className="mt-1 block text-xs text-muted">
                            {lead.source}
                          </span>
                        </div>
                        <Badge tone={lead.score >= 80 ? "success" : "info"}>
                          {lead.score}
                        </Badge>
                      </div>
                      <p className="mt-4 text-sm font-medium">
                        {lead.interest}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {lead.nextAction}
                      </p>
                      {lead.stage === "booked" ? (
                        <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle size={15} /> Convertido a cliente
                        </span>
                      ) : (
                        <div className="mt-4 grid gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={pendingLeadId === lead.id}
                            onClick={() => void prepareFollowUp(lead.id)}
                          >
                            <Sparkle size={14} /> Preparar seguimiento
                          </Button>
                          <button
                            type="button"
                            disabled={pendingLeadId === lead.id}
                            onClick={() => void convertLead(lead.id)}
                            className="inline-flex min-h-8 items-center justify-center gap-1 text-xs font-semibold text-forest disabled:opacity-50"
                          >
                            Simular reserva <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                  {!leads.length ? (
                    <p className="rounded-xl border border-dashed border-line px-3 py-5 text-center text-xs text-muted">
                      Sin oportunidades en esta fase.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <UserPlus size={15} /> En producción, las oportunidades podrán llegar
        desde formularios, campañas, llamadas y recomendaciones.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface rounded-2xl p-4">
      <strong className="block text-2xl tracking-tight">{value}</strong>
      <span className="mt-1 block text-xs text-muted">{label}</span>
    </article>
  );
}
