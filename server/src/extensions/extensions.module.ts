import { Module } from '@nestjs/common';
import { ExtensionsController } from './extensions.controller';
import { ExtensionsService } from './extensions.service';
import { DbService } from '../common/services/db.service';

@Module({
  controllers: [ExtensionsController],
  providers: [ExtensionsService, DbService],
})
export class ExtensionsModule {}
