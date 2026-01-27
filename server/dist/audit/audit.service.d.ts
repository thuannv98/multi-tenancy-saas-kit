export interface AuditEntry {
    practiceId?: string;
    actor?: string;
    action?: string;
    target?: string;
    outcome?: 'pending' | 'completed' | 'failed';
    timestamp: string;
}
export declare class AuditService {
    private static audits;
    record(entry: Omit<AuditEntry, 'timestamp'>): Promise<AuditEntry>;
    getAudits(): AuditEntry[];
    clear(): void;
}
