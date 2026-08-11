import type { Lead } from "~/domain/models";

export type FollowUpDraft = {
  subject: string;
  body: string;
};

export interface CustomerEngagementProvider {
  draftFollowUp(lead: Lead): Promise<FollowUpDraft>;
}
