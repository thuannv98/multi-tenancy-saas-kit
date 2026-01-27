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
exports.DbService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let DbService = class DbService {
    pool;
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (connectionString) {
            this.pool = new pg_1.Pool({ connectionString });
        }
        else {
            this.pool = new pg_1.Pool({
                host: process.env.PG_HOST,
                port: Number(process.env.PG_PORT),
                user: process.env.PG_USER,
                password: process.env.PG_PASSWORD,
                database: process.env.DB_NAME,
            });
        }
    }
    async onModuleInit() {
        console.info('DbService initialized (lazy connection)');
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
    async query(text, params) {
        try {
            return await this.pool.query(text, params);
        }
        catch (err) {
            throw err;
        }
    }
};
exports.DbService = DbService;
exports.DbService = DbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DbService);
//# sourceMappingURL=db.service.js.map