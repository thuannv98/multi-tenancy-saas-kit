export declare class ActionsService {
    private readonly queries;
    private readonly db;
    getHello(): string;
    hasUserPermission(username: string, permissionName: string): Promise<boolean>;
    isScopeApproved(practiceId: string, permissionName: string): Promise<boolean>;
}
