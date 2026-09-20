import type { FastifyInstance } from 'fastify';
import type { WorkflowConvention } from '@gitea-portal/domain';
export function registerWorkflowConventionRoutes(app: FastifyInstance, conventions: WorkflowConvention[]): void {
  app.get('/api/workflow-conventions', async () => conventions);
}
