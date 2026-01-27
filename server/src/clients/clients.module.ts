import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { DbService } from '../common/services/db.service';
import { ActionsService } from 'src/actions/actions.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, DbService, ActionsService],
})
export class ClientsModule {}
