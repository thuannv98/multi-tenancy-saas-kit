import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class DbService implements OnModuleInit, OnModuleDestroy {
    private pool;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query(text: string, params?: any[]): Promise<any>;
}
