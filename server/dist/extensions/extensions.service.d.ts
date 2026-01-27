import { DbService } from '../common/services/db.service';
export interface ExtensionManifest {
    name: string;
    slot: string;
    requiredScopes?: string[];
    requiredRoles?: string[];
}
export declare class ExtensionsService {
    private readonly db;
    private static manifests;
    constructor(db: DbService);
    resolveExtensions(practiceId: string, clientId: string, slot: string, username?: string): Promise<{
        name: string;
        slot: string;
        requiredScopes: string[];
        requiredRoles: string[];
    }[]>;
}
