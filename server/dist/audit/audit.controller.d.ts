import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditsByPractice(practiceId: string): import("./audit.service").AuditEntry[];
}
