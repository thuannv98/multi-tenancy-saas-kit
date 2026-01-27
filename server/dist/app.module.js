"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const actions_module_1 = require("./actions/actions.module");
const clients_module_1 = require("./clients/clients.module");
const db_service_1 = require("./common/services/db.service");
const audit_module_1 = require("./audit/audit.module");
const extensions_module_1 = require("./extensions/extensions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            actions_module_1.ActionsModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: '/var/run/postgresql',
                username: 'postgres',
                password: 'postgres',
                database: 'ak',
            }),
            audit_module_1.AuditModule,
            extensions_module_1.ExtensionsModule,
            clients_module_1.ClientsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, db_service_1.DbService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map