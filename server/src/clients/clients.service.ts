import { Injectable } from '@nestjs/common';
import { DbService } from '../common/services/db.service';
import { ActionsService } from 'src/actions/actions.service';

@Injectable()
export class ClientsService {
  constructor(private readonly db: DbService, private readonly actionSerivce: ActionsService) {}

  async listForPractice(practiceName: string) {
    const sql = `SELECT c.id, c.practice_id, c.name FROM clients c JOIN practices p ON c.practice_id = p.id WHERE p.name = $1 ORDER BY c.id`;
    try {
      const res = await this.db.query(sql, [practiceName]);
      return res.rows || [];
    } catch (err) {
      return [];
    }
  }

  async create(practiceName: string, name: string, secret: string, username?: string) {
    // verify user has permission: 'write:clients'
    if (username) {
      const ok = await this.actionSerivce.hasUserPermission(username, 'write:clients');
      if (!ok) throw new Error('forbidden');
    }

    const sql = `INSERT INTO clients (practice_id, name, secret) VALUES ((SELECT id FROM practices WHERE name = $1), $2, $3) RETURNING id, practice_id, name`;
    const res = await this.db.query(sql, [practiceName, name, secret]);
    return res.rows[0];
  }
}
