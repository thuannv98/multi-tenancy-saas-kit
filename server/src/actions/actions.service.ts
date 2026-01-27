import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { DbService } from 'src/common/services/db.service';

@Injectable()
export class ActionsService {
   private readonly queries = {
      hasUserPermission: `SELECT 1 FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = $1 AND p.name = $2
LIMIT 1`,
      isScopeApproved: `SELECT ip.is_approved FROM integration_permissions ip
JOIN permissions p ON ip.permission_id = p.id
JOIN practices pr ON ip.practice_id = pr.id
WHERE p.name = $1 AND pr.name = $2
LIMIT 1`,
   };

   private readonly db: DbService = new DbService();

   getHello(): string {
      return 'Hello World!';
   }

   /**
   * Check whether a given username has a named permission by querying the DB.
   * This will try the `pg` Pool first and fall back to invoking `psql` as the local postgres user.
   */
   async hasUserPermission(username: string, permissionName: string): Promise<boolean> {
      try {
         const res = await this.db.query(this.queries.hasUserPermission, [username, permissionName]);
         return res.rowCount > 0;
      } catch (err) {
         console.error(err);
         throw err;
      }
   }

   async isScopeApproved(practiceId: string, permissionName: string): Promise<boolean> {
      const res = await this.db.query(this.queries.isScopeApproved, [permissionName, practiceId]);
      return res && res.rowCount > 0 ? res.rows[0].is_approved : false;
   }
}
