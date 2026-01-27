import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActionsModule } from './actions/actions.module';
import { ClientsModule } from './clients/clients.module';
import { DbService } from './common/services/db.service';
import { AuditModule } from './audit/audit.module';
import { ExtensionsModule } from './extensions/extensions.module';

@Module({
  imports: [
    ActionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '/var/run/postgresql', // Unix socket directory
      username: 'postgres',
      password: 'postgres', // empty string, peer handles auth
      database: 'ak',
    }),
    AuditModule,
    ExtensionsModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
