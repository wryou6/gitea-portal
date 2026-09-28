import type { FastifyInstance } from "fastify";
import {
  FIXED_ISSUE_STATUSES,
  STATUS_ACTIONS,
  statusActionLabel,
} from "@gitea-portal/domain";

export function registerStatusDefinitionRoutes(app: FastifyInstance): void {
  app.get("/api/status-definition", async () => ({
    states: FIXED_ISSUE_STATUSES,
    actions: STATUS_ACTIONS.map((action) => ({
      ...action,
      labelName: statusActionLabel(action.key),
    })),
  }));
}
