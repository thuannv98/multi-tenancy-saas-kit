import { EmailProviderService } from '../common/services/emailProvider.service';
import { ActionsService } from './actions.service';
import { AuditEntry, AuditService } from '../audit/audit.service';
interface ActionRequest {
    action: string;
    inputs: Record<string, any>;
}
export declare class ActionsController {
    private readonly emailProvider;
    private readonly actionService;
    private readonly auditService;
    private static runs;
    private static runCounter;
    private static idempotencyMap;
    private static supportedActions;
    constructor(emailProvider: EmailProviderService, actionService: ActionsService, auditService: AuditService);
    executeAction(practiceId: string, body: ActionRequest, userHeader?: string): Promise<{
        runId: number;
        status: "pending" | "completed" | "failed";
        duplicate: boolean;
    }>;
    getAudits(): AuditEntry[];
}
export {};
