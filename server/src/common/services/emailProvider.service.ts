import { Injectable } from '@nestjs/common';
import { get } from 'http';

export interface MailMessage {
	practice_id: string;
	client_id: string;
	to: string | string[];
	subject: string;
	body: string;
	timestamp: string;
}

@Injectable()
export class EmailProviderService {
	private static sentMails: MailMessage[] = [];
	private static actionScopeMap: Map<string, string> = new Map([
		['email.send', 'email.write'],
	]);

	/**
	 * Mock sending an email by storing it in-memory.
	 * Returns a resolved promise to mimic async transport.
	 */
	async send(mail: Omit<MailMessage, 'timestamp'>): Promise<void> {
		const message: MailMessage = {
			...mail,
			timestamp: new Date().toISOString(),
		};
		EmailProviderService.sentMails.push(message);
		return Promise.resolve();
	}

	/** Return a copy of all sent messages */
	getSent(): ReadonlyArray<MailMessage> {
		return EmailProviderService.sentMails.slice();
	}

	/** Return the last sent message or undefined */
	last(): MailMessage | undefined {
		return EmailProviderService.sentMails[EmailProviderService.sentMails.length - 1];
	}

	/** Clear stored messages (useful for tests) */
	clear(): void {
		EmailProviderService.sentMails = [];
	}

	/** Return the action scope for a given action */
	getActionScope(action: string): string | undefined {
		return EmailProviderService.actionScopeMap.get(action);
	}
}
