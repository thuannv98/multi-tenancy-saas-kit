export interface MailMessage {
    practice_id: string;
    client_id: string;
    to: string | string[];
    subject: string;
    body: string;
    timestamp: string;
}
export declare class EmailProviderService {
    private static sentMails;
    private static actionScopeMap;
    send(mail: Omit<MailMessage, 'timestamp'>): Promise<void>;
    getSent(): ReadonlyArray<MailMessage>;
    last(): MailMessage | undefined;
    clear(): void;
    getActionScope(action: string): string | undefined;
}
