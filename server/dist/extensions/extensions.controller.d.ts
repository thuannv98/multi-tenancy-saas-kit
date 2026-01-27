import { ExtensionsService } from './extensions.service';
export declare class ExtensionsController {
    private readonly extensionsService;
    constructor(extensionsService: ExtensionsService);
    getExtensions(practiceId: string, clientId: string, slot: string, userHeader?: string): Promise<{
        name: string;
        slot: string;
        requiredScopes: string[];
        requiredRoles: string[];
    }[]>;
}
