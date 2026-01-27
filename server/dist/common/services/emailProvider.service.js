"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProviderService = void 0;
const common_1 = require("@nestjs/common");
let EmailProviderService = class EmailProviderService {
    static { EmailProviderService_1 = this; }
    static sentMails = [];
    static actionScopeMap = new Map([
        ['email.send', 'email.write'],
    ]);
    async send(mail) {
        const message = {
            ...mail,
            timestamp: new Date().toISOString(),
        };
        EmailProviderService_1.sentMails.push(message);
        return Promise.resolve();
    }
    getSent() {
        return EmailProviderService_1.sentMails.slice();
    }
    last() {
        return EmailProviderService_1.sentMails[EmailProviderService_1.sentMails.length - 1];
    }
    clear() {
        EmailProviderService_1.sentMails = [];
    }
    getActionScope(action) {
        return EmailProviderService_1.actionScopeMap.get(action);
    }
};
exports.EmailProviderService = EmailProviderService;
exports.EmailProviderService = EmailProviderService = EmailProviderService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailProviderService);
//# sourceMappingURL=emailProvider.service.js.map