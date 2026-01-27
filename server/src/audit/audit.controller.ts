import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('practices/:practiceId/audit')
export class AuditController {
	constructor(private readonly auditService: AuditService) {}

	@Get()
	getAuditsByPractice(@Param('practiceId') practiceId: string) {
		const all = this.auditService.getAudits();
		return all.filter((a) => a.practiceId === practiceId);
	}
}
