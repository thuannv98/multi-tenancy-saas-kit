"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../common/services/db.service");
const actions_service_1 = require("../actions/actions.service");
let ClientsService = class ClientsService {
    db;
    actionSerivce;
    constructor(db, actionSerivce) {
        this.db = db;
        this.actionSerivce = actionSerivce;
    }
    async listForPractice(practiceName) {
        const sql = `SELECT c.id, c.practice_id, c.name FROM clients c JOIN practices p ON c.practice_id = p.id WHERE p.name = $1 ORDER BY c.id`;
        try {
            const res = await this.db.query(sql, [practiceName]);
            return res.rows || [];
        }
        catch (err) {
            return [];
        }
    }
    async create(practiceName, name, secret, username) {
        if (username) {
            const ok = await this.actionSerivce.hasUserPermission(username, 'write:clients');
            if (!ok)
                throw new Error('forbidden');
        }
        const sql = `INSERT INTO clients (practice_id, name, secret) VALUES ((SELECT id FROM practices WHERE name = $1), $2, $3) RETURNING id, practice_id, name`;
        const res = await this.db.query(sql, [practiceName, name, secret]);
        return res.rows[0];
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService, actions_service_1.ActionsService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map