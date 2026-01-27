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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ActionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsController = void 0;
const common_1 = require("@nestjs/common");
const emailProvider_service_1 = require("../common/services/emailProvider.service");
const actions_service_1 = require("./actions.service");
const audit_service_1 = require("../audit/audit.service");
let ActionsController = class ActionsController {
    static { ActionsController_1 = this; }
    emailProvider;
    actionService;
    auditService;
    static runs = [];
    static runCounter = 1;
    static idempotencyMap = new Map();
    static supportedActions = ['email.send'];
    constructor(emailProvider, actionService, auditService) {
        this.emailProvider = emailProvider;
        this.actionService = actionService;
        this.auditService = auditService;
    }
    async executeAction(practiceId, body, userHeader) {
        if (!body || typeof body !== 'object') {
            throw new common_1.HttpException('Invalid body', common_1.HttpStatus.BAD_REQUEST);
        }
        const { action, inputs } = body;
        const audit = {
            practiceId,
            actor: userHeader || 'unknown',
            action: action,
            target: inputs.client_id || 'unknown',
            outcome: 'pending',
        };
        if (!action || !inputs) {
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new common_1.HttpException('Missing action or inputs', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!ActionsController_1.supportedActions.includes(action)) {
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new common_1.HttpException('Unsupported action', common_1.HttpStatus.BAD_REQUEST);
        }
        const user = (userHeader || '').toString();
        let hasPermission = false;
        if (user) {
            hasPermission = await this.actionService.hasUserPermission(user, `action:${action}`);
            console.log('hasPermission', hasPermission);
        }
        if (!hasPermission) {
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new common_1.HttpException('Forbidden: missing permission for action', common_1.HttpStatus.FORBIDDEN);
        }
        const actionScope = this.emailProvider.getActionScope(action);
        if (!actionScope) {
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new common_1.HttpException('Unsupported action scope', common_1.HttpStatus.BAD_REQUEST);
        }
        const permissionName = `action:${actionScope}`;
        try {
            const approved = await this.actionService.isScopeApproved(practiceId, permissionName);
            if (!approved) {
                audit.outcome = 'failed';
                await this.auditService.record(audit);
                throw new common_1.HttpException('Integration permission not approved for this practice', common_1.HttpStatus.FORBIDDEN);
            }
        }
        catch (err) {
            if (err instanceof common_1.HttpException)
                throw err;
            audit.outcome = 'failed';
            await this.auditService.record(audit);
            throw new common_1.HttpException('Failed to verify integration permissions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const idempotencyKey = inputs.idempotency_key;
        if (idempotencyKey) {
            const existing = ActionsController_1.idempotencyMap.get(idempotencyKey);
            if (existing) {
                return {
                    runId: existing.id,
                    status: existing.status,
                    duplicate: true,
                };
            }
        }
        const run = {
            id: ActionsController_1.runCounter++,
            practiceId,
            action,
            inputs,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        ActionsController_1.runs.push(run);
        if (idempotencyKey)
            ActionsController_1.idempotencyMap.set(idempotencyKey, run);
        let result = null;
        try {
            if (action === 'email.send') {
                const to = inputs.to;
                const subject = inputs.subject || '';
                const text = inputs.body || inputs.text || '';
                await this.emailProvider.send({ practice_id: practiceId, client_id: inputs.client_id, to, subject, body: text });
                run.status = 'completed';
                run.completedAt = new Date().toISOString();
                result = { message: 'email queued' };
            }
        }
        catch (err) {
            run.status = 'failed';
            run.completedAt = new Date().toISOString();
            throw err instanceof common_1.HttpException ? err : new common_1.HttpException('Action execution failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        finally {
            try {
                audit.outcome = 'completed';
                await this.auditService.record(audit);
            }
            catch (auditErr) {
                console.error('failed to write audit', auditErr);
            }
        }
        return {
            runId: run.id,
            status: run.status,
            duplicate: false,
        };
    }
    getAudits() {
        return this.auditService.getAudits();
    }
};
exports.ActionsController = ActionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('practiceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ActionsController.prototype, "executeAction", null);
__decorate([
    (0, common_1.Get)('_debug/audits'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "getAudits", null);
exports.ActionsController = ActionsController = ActionsController_1 = __decorate([
    (0, common_1.Controller)('practices/:practiceId/actions'),
    __metadata("design:paramtypes", [emailProvider_service_1.EmailProviderService,
        actions_service_1.ActionsService,
        audit_service_1.AuditService])
], ActionsController);
//# sourceMappingURL=actions.controller.js.map