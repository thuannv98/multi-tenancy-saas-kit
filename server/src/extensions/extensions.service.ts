import { Injectable } from '@nestjs/common';
import { DbService } from '../common/services/db.service';

export interface ExtensionManifest {
	name: string;
	slot: string;
	requiredScopes?: string[]; // permission names, e.g. 'action:email.write'
	requiredRoles?: string[]; // role names allowed to see
}

@Injectable()
export class ExtensionsService {
	// Minimal hardcoded manifest
	private static manifests: ExtensionManifest[] = [
		{
			name: 'email-composer',
			slot: 'client.sidepanel',
			requiredScopes: ['action:email.write'],
			requiredRoles: ['PracticeAdmin', 'Staff'],
		},
		{
			name: 'client-metrics',
			slot: 'client.sidepanel',
			requiredScopes: [],
			requiredRoles: ['PracticeAdmin'],
		},
		{
			name: 'integration-debug',
			slot: 'client.sidepanel',
			requiredScopes: ['action:email.send'],
			requiredRoles: ['PracticeAdmin', 'Integration'],
		},
	];

	constructor(private readonly db: DbService) {}

	async resolveExtensions(practiceId: string, clientId: string, slot: string, username?: string) {
		// Get approved permission names for the practice
		const sqlApproved = `SELECT p.name FROM integration_permissions ip
JOIN permissions p ON ip.permission_id = p.id
JOIN practices pr ON ip.practice_id = pr.id
WHERE pr.name = $1 AND ip.is_approved = true`;
		let approvedSet = new Set<string>();
		try {
			const res = await this.db.query(sqlApproved, [practiceId]);
			if (res && res.rows) {
				for (const r of res.rows) approvedSet.add(r.name);
			}
		} catch (err) {
			approvedSet = new Set();
		}

		// Get user roles
		let userRoles = new Set<string>();
		if (username) {
			const sqlRoles = `SELECT r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON r.id = ur.role_id WHERE u.username = $1`;
			try {
				const res = await this.db.query(sqlRoles, [username]);
				if (res && res.rows) {
					for (const r of res.rows) userRoles.add(r.name);
				}
			} catch (err) {
				userRoles = new Set();
			}
		}

		// Filter manifests
		const candidates = ExtensionsService.manifests.filter((m) => m.slot === slot);
		const allowed = candidates.filter((m) => {
			// requiredScopes must be subset of approvedSet
			const reqScopes = m.requiredScopes || [];
			for (const s of reqScopes) {
				if (!approvedSet.has(s)) return false;
			}
			// If requiredRoles specified, user must have at least one
			if (m.requiredRoles && m.requiredRoles.length > 0) {
				if (!username) return false;
				const intersect = m.requiredRoles.some((r) => userRoles.has(r));
				if (!intersect) return false;
			}
			return true;
		});

		// Return a minimal view
		return allowed.map((m) => ({ name: m.name, slot: m.slot, requiredScopes: m.requiredScopes || [], requiredRoles: m.requiredRoles || [] }));
	}
}
