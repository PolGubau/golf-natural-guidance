import type { DemoData, LeadStage } from "~/domain/models";

export function prepareLeadFollowUp(
  data: DemoData,
  leadId: string,
  now = new Date().toISOString(),
): DemoData {
  const lead = data.leads.find((item) => item.id === leadId);
  if (!lead) return data;
  const taskExists = data.automationTasks.some(
    (task) => task.leadId === leadId && task.status !== "completed",
  );
  return {
    ...data,
    leads: data.leads.map((item) =>
      item.id === leadId
        ? {
            ...item,
            stage: item.stage === "new" ? "contacted" : item.stage,
            nextAction: "Revisar el seguimiento preparado",
          }
        : item,
    ),
    automationTasks: taskExists
      ? data.automationTasks.map((task) =>
          task.leadId === leadId && task.status !== "completed"
            ? { ...task, status: "ready" }
            : task,
        )
      : [
          ...data.automationTasks,
          {
            id: `automation-${leadId}-${Date.now()}`,
            leadId,
            title: `Seguimiento para ${lead.name}`,
            detail: `Propuesta de contacto sobre ${lead.interest}.`,
            status: "ready",
            createdAt: now,
          },
        ],
  };
}

export function completeAutomationTask(
  data: DemoData,
  taskId: string,
): DemoData {
  return {
    ...data,
    automationTasks: data.automationTasks.map((task) =>
      task.id === taskId ? { ...task, status: "completed" } : task,
    ),
  };
}

export function updateLeadStage(
  data: DemoData,
  leadId: string,
  stage: LeadStage,
): DemoData {
  return {
    ...data,
    leads: data.leads.map((lead) =>
      lead.id === leadId ? { ...lead, stage } : lead,
    ),
  };
}
