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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async list(practiceId) {
        return this.clientsService.listForPractice(practiceId);
    }
    async create(practiceId, body, userHeader) {
        const username = (userHeader || '').toString();
        if (!body || !body.name)
            throw new common_1.HttpException('Missing name', common_1.HttpStatus.BAD_REQUEST);
        try {
            const client = await this.clientsService.create(practiceId, body.name, body.secret || 'secret', username);
            return client;
        }
        catch (err) {
            if (err.message === 'forbidden')
                throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
            throw new common_1.HttpException('Creation failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('practiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('practiceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "create", null);
exports.ClientsController = ClientsController = __decorate([
    (0, common_1.Controller)('practices/:practiceId/clients'),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map