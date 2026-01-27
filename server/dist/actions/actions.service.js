"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../common/services/db.service");
let ActionsService = class ActionsService {
    queries = {
        hasUserPermission: `SELECT 1 FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = $1 AND p.name = $2
LIMIT 1`,
        isScopeApproved: `SELECT ip.is_approved FROM integration_permissions ip
JOIN permissions p ON ip.permission_id = p.id
JOIN practices pr ON ip.practice_id = pr.id
WHERE p.name = $1 AND pr.name = $2
LIMIT 1`,
    };
    db = new db_service_1.DbService();
    getHello() {
        return 'Hello World!';
    }
    async hasUserPermission(username, permissionName) {
        try {
            const res = await this.db.query(this.queries.hasUserPermission, [username, permissionName]);
            return res.rowCount > 0;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async isScopeApproved(practiceId, permissionName) {
        const res = await this.db.query(this.queries.isScopeApproved, [permissionName, practiceId]);
        return res && res.rowCount > 0 ? res.rows[0].is_approved : false;
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)()
], ActionsService);
//# sourceMappingURL=actions.service.js.map