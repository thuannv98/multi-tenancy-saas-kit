import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { EmailProviderService } from '../common/services/emailProvider.service';
import { DbService } from '../common/services/db.service';
import { AuditService } from 'src/audit/audit.service';

@Module({
  controllers: [ActionsController],
  providers: [ActionsService, EmailProviderService, DbService, AuditService],
})
export class ActionsModule {}
