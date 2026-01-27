import { Injectable } from '@nestjs/common';

export interface AuditEntry {
	practiceId?: string;
	actor?: string;
	action?: string;
   target?: string;
	outcome?: 'pending' | 'completed' | 'failed';
	timestamp: string;
}

@Injectable()
export class AuditService {
	private static audits: AuditEntry[] = [];

	async record(entry: Omit<AuditEntry, 'timestamp'>): Promise<AuditEntry> {
		const audit: AuditEntry = {
			...entry,
			timestamp: new Date().toISOString(),
		};
		AuditService.audits.push(audit);
		return audit;
	}

	getAudits(): AuditEntry[] {
		return AuditService.audits.slice();
	}

	clear(): void {
		AuditService.audits = [];
	}
}
