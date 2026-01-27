import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    list(practiceId: string): Promise<any>;
    create(practiceId: string, body: {
        name: string;
        secret?: string;
    }, userHeader?: string): Promise<any>;
}
