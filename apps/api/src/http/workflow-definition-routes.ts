import type { FastifyInstance } from "fastify";
import {
  FIXED_WORKFLOW_STATES,
  WORKFLOW_ACTIONS,
  workflowActionLabel,
} from "@gitea-portal/domain";

export function registerWorkflowDefinitionRoutes(app: FastifyInstance): void {
  app.get("/api/workflow-definition", async () => ({
    states: FIXED_WORKFLOW_STATES,
    actions: WORKFLOW_ACTIONS.map((action) => ({
      ...action,
      labelName: workflowActionLabel(action.key),
    })),
  }));
}
