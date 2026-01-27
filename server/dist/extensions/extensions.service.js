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
var ExtensionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionsService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../common/services/db.service");
let ExtensionsService = class ExtensionsService {
    static { ExtensionsService_1 = this; }
    db;
    static manifests = [
        {
            name: 'email-composer',
            slot: 'client.sidepanel',
            requiredScopes: ['action:email.write'],
            requiredRoles: ['PracticeAdmin', 'Staff'],
        },
        {
            name: 'client-metrics',
            slot: 'client.sidepanel',
            requiredScopes: [],
            requiredRoles: ['PracticeAdmin'],
        },
        {
            name: 'integration-debug',
            slot: 'client.sidepanel',
            requiredScopes: ['action:email.send'],
            requiredRoles: ['PracticeAdmin', 'Integration'],
        },
    ];
    constructor(db) {
        this.db = db;
    }
    async resolveExtensions(practiceId, clientId, slot, username) {
        const sqlApproved = `SELECT p.name FROM integration_permissions ip
JOIN permissions p ON ip.permission_id = p.id
JOIN practices pr ON ip.practice_id = pr.id
WHERE pr.name = $1 AND ip.is_approved = true`;
        let approvedSet = new Set();
        try {
            const res = await this.db.query(sqlApproved, [practiceId]);
            if (res && res.rows) {
                for (const r of res.rows)
                    approvedSet.add(r.name);
            }
        }
        catch (err) {
            approvedSet = new Set();
        }
        let userRoles = new Set();
        if (username) {
            const sqlRoles = `SELECT r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON r.id = ur.role_id WHERE u.username = $1`;
            try {
                const res = await this.db.query(sqlRoles, [username]);
                if (res && res.rows) {
                    for (const r of res.rows)
                        userRoles.add(r.name);
                }
            }
            catch (err) {
                userRoles = new Set();
            }
        }
        const candidates = ExtensionsService_1.manifests.filter((m) => m.slot === slot);
        const allowed = candidates.filter((m) => {
            const reqScopes = m.requiredScopes || [];
            for (const s of reqScopes) {
                if (!approvedSet.has(s))
                    return false;
            }
            if (m.requiredRoles && m.requiredRoles.length > 0) {
                if (!username)
                    return false;
                const intersect = m.requiredRoles.some((r) => userRoles.has(r));
                if (!intersect)
                    return false;
            }
            return true;
        });
        return allowed.map((m) => ({ name: m.name, slot: m.slot, requiredScopes: m.requiredScopes || [], requiredRoles: m.requiredRoles || [] }));
    }
};
exports.ExtensionsService = ExtensionsService;
exports.ExtensionsService = ExtensionsService = ExtensionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], ExtensionsService);
//# sourceMappingURL=extensions.service.js.map