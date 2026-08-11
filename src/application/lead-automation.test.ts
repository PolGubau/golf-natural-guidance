import { describe, expect, it } from "vitest";
import { createSeed } from "~/infrastructure/seed";
import {
  completeAutomationTask,
  prepareLeadFollowUp,
  updateLeadStage,
} from "./lead-automation";

describe("lead automation", () => {
  it("prepares a follow-up without duplicating an active task", () => {
    const data = createSeed();
    const result = prepareLeadFollowUp(data, "lead-daniel");

    expect(
      result.leads.find((lead) => lead.id === "lead-daniel")?.nextAction,
    ).toBe("Revisar el seguimiento preparado");
    expect(result.automationTasks).toHaveLength(
      data.automationTasks.length + 1,
    );
    expect(
      prepareLeadFollowUp(result, "lead-daniel").automationTasks,
    ).toHaveLength(result.automationTasks.length);
  });

  it("activates an existing assistant suggestion when preparing a lead", () => {
    const data = createSeed();
    const result = prepareLeadFollowUp(data, "lead-elena");

    expect(
      result.automationTasks.find((task) => task.id === "automation-seed-elena")
        ?.status,
    ).toBe("ready");
  });

  it("lets the team complete a task and move a lead through the pipeline", () => {
    const data = createSeed();
    const completed = completeAutomationTask(data, "automation-seed-clara");
    const converted = updateLeadStage(completed, "lead-clara", "booked");

    expect(
      converted.automationTasks.find(
        (task) => task.id === "automation-seed-clara",
      )?.status,
    ).toBe("completed");
    expect(
      converted.leads.find((lead) => lead.id === "lead-clara")?.stage,
    ).toBe("booked");
  });
});
