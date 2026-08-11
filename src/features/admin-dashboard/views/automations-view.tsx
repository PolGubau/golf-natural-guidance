"use client";

import {
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  SparkleIcon as Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { completeAutomationTask } from "~/application/lead-automation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { DemoData } from "~/domain/models";
import { useDemo } from "~/infrastructure/state/demo-store";

export function AutomationsView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [pendingTaskId, setPendingTaskId] = useState<string>();
  const tasks = [...data.automationTasks].sort((a, b) =>
    a.status.localeCompare(b.status),
  );
  const complete = async (taskId: string) => {
    setPendingTaskId(taskId);
    await commit((current) => completeAutomationTask(current, taskId));
    setPendingTaskId(undefined);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
            Asistente operativo
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Seguimientos listos para revisar
          </h2>
          <p className="mt-1 text-sm text-muted">
            El asistente detecta oportunidades y prepara el siguiente paso para
            el equipo.
          </p>
        </div>
        <Badge tone="info">Simulación de IA con revisión humana</Badge>
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Bandeja de automatizaciones</h3>
              <p className="mt-1 text-xs text-muted">
                Ninguna comunicación se envía sin revisión en esta demo.
              </p>
            </div>
            <Badge>
              {tasks.filter((task) => task.status !== "completed").length}
            </Badge>
          </div>
          <div className="mt-5 divide-y divide-line">
            {tasks.map((task) => {
              const lead = data.leads.find((item) => item.id === task.leadId);
              const completed = task.status === "completed";
              return (
                <article key={task.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/10 text-forest">
                        {completed ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Sparkle size={18} />
                        )}
                      </span>
                      <div>
                        <strong className="block text-sm">{task.title}</strong>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {task.detail} {lead ? `· ${lead.email}` : ""}
                        </p>
                      </div>
                    </div>
                    {completed ? (
                      <Badge tone="success">Revisada</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingTaskId === task.id}
                        onClick={() => void complete(task.id)}
                      >
                        <CheckCircle size={14} /> Marcar revisada
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="rounded-[22px] border border-forest/15 bg-forest p-5 text-white">
          <span className="grid size-10 place-items-center rounded-xl bg-white/12 text-coral">
            <Sparkle size={20} />
          </span>
          <h3 className="mt-5 text-lg font-semibold">Prioridad de hoy</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Responder a Elena: tiene alta intención y todavía no ha elegido
            horario para su primera clase.
          </p>
          <div className="mt-5 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/75">
            “Hola Elena, hemos preparado una primera clase adaptada a tu nivel.
            Te ayudo a encontrar el horario ideal.”
          </div>
          <Link
            href="/admin/captacion"
            className="mt-5 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-white underline decoration-coral underline-offset-4"
          >
            Ver pipeline de captación <Clock size={14} />
          </Link>
        </aside>
      </section>
    </div>
  );
}
