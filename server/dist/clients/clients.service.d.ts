import { DbService } from '../common/services/db.service';
import { ActionsService } from 'src/actions/actions.service';
export declare class ClientsService {
    private readonly db;
    private readonly actionSerivce;
    constructor(db: DbService, actionSerivce: ActionsService);
    listForPractice(practiceName: string): Promise<any>;
    create(practiceName: string, name: string, secret: string, username?: string): Promise<any>;
}
