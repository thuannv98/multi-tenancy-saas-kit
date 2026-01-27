import {
   Controller,
   Post,
   Param,
   Body,
   Headers,
   HttpException,
   HttpStatus,
   Inject,
   Get,
} from '@nestjs/common';
import { EmailProviderService } from '../common/services/emailProvider.service';
import { ActionsService } from './actions.service';
import { AuditEntry, AuditService } from '../audit/audit.service';

interface ActionRequest {
   action: string;
   inputs: Record<string, any>;
}

interface ActionRun {
   id: number;
   practiceId: string;
   action: string;
   inputs: Record<string, any>;
   status: 'pending' | 'completed' | 'failed';
   createdAt: string;
   completedAt?: string;
}

@Controller('practices/:practiceId/actions')
export class ActionsController {
   private static runs: ActionRun[] = [];
   private static runCounter = 1;
   private static idempotencyMap: Map<string, ActionRun> = new Map();
   private static supportedActions = ['email.send'];

   constructor(
      private readonly emailProvider: EmailProviderService,
      private readonly actionService: ActionsService,
      private readonly auditService: AuditService,
   ) {}

   /**
    * POST handler to execute actions.
    * Expected body shape:
    * { action: 'email.send', inputs: { client_id, to, subject, body, idempotency_key } }
    * Requires header `x-user` containing the username (simple mock - represent the user creds, e.g, cookie, jwt).
    */
   @Post()
   async executeAction(
      @Param('practiceId') practiceId: string,
      @Body() body: ActionRequest,
      @Headers('x-user') userHeader?: string,
   ) {
      if (!body || typeof body !== 'object') {
         throw new HttpException('Invalid body', HttpStatus.BAD_REQUEST);
      }

      const { action, inputs } = body as ActionRequest;
      const audit: Omit<AuditEntry, 'timestamp'> = {
         practiceId,
         actor: userHeader || 'unknown',
         action: action,
         target: inputs.client_id || 'unknown',
         outcome: 'pending',
      };

      if (!action || !inputs) {
         audit.outcome = 'failed';
         await this.auditService.record(audit);
         throw new HttpException('Missing action or inputs', HttpStatus.BAD_REQUEST);
      }

      if (!ActionsController.supportedActions.includes(action)) {
         audit.outcome = 'failed';
         await this.auditService.record(audit);
         throw new HttpException('Unsupported action', HttpStatus.BAD_REQUEST);
      }

      // Permission check via database if `x-user` header provided, otherwise fallback to `x-permissions` header
      const user = (userHeader || '').toString();
      let hasPermission = false;

      if (user) {
         hasPermission = await this.actionService.hasUserPermission(user, `action:${action}`);
         console.log('hasPermission', hasPermission)
      }

      if (!hasPermission) {
         audit.outcome = 'failed';
         await this.auditService.record(audit);
         throw new HttpException('Forbidden: missing permission for action', HttpStatus.FORBIDDEN);
      }

      // Integration-level permission: check whether the integration has approval
      // for the action's scope for this practice. The EmailProvider exposes a
      // scope string (e.g. 'email:write') which we map to a permission name
      // in the DB (e.g. 'action:email.write'). If not approved, block the action.
      const actionScope = this.emailProvider.getActionScope(action);
      if (!actionScope) {
         audit.outcome = 'failed';
         await this.auditService.record(audit);
         throw new HttpException('Unsupported action scope', HttpStatus.BAD_REQUEST);
      }

      const permissionName = `action:${actionScope}`;
      try {
         const approved = await this.actionService.isScopeApproved(practiceId, permissionName);
         if (!approved) {
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new HttpException('Integration permission not approved for this practice', HttpStatus.FORBIDDEN);
         }
      } catch (err) {
         if (err instanceof HttpException) throw err;
         audit.outcome = 'failed';
         await this.auditService.record(audit);
         throw new HttpException('Failed to verify integration permissions', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Idempotency: require idempotency_key in inputs for deduplication
      const idempotencyKey = inputs.idempotency_key;
      if (idempotencyKey) {
         const existing = ActionsController.idempotencyMap.get(idempotencyKey);
         if (existing) {
            return {
               runId: existing.id,
               status: existing.status,
               duplicate: true,
            };
         }
      }

      // Record the action run (pending)
      const run: ActionRun = {
         id: ActionsController.runCounter++,
         practiceId,
         action,
         inputs,
         status: 'pending',
         createdAt: new Date().toISOString(),
      };
      ActionsController.runs.push(run);
      if (idempotencyKey) ActionsController.idempotencyMap.set(idempotencyKey, run);

      // Execute action: only support email.send in this mock
      let result: any = null;
      try {
         if (action === 'email.send') {
            const to = inputs.to;
            const subject = inputs.subject || '';
            const text = inputs.body || inputs.text || '';

            await this.emailProvider.send({ practice_id: practiceId, client_id: inputs.client_id, to, subject, body: text });
            run.status = 'completed';
            run.completedAt = new Date().toISOString();
            result = { message: 'email queued' };
         }
      } catch (err) {
         run.status = 'failed';
         run.completedAt = new Date().toISOString();
         // surface error
         throw err instanceof HttpException ? err : new HttpException('Action execution failed', HttpStatus.INTERNAL_SERVER_ERROR);
      } finally {
         try {
            audit.outcome = 'completed';
            await this.auditService.record(audit);
         } catch (auditErr) {
            // don't block main flow on audit failures
            // eslint-disable-next-line no-console
            console.error('failed to write audit', auditErr);
         }
      }

      return {
         runId: run.id,
         status: run.status,
         duplicate: false,
      };
   }

   @Get('_debug/audits')
   getAudits() {
      return this.auditService.getAudits();
   }
}