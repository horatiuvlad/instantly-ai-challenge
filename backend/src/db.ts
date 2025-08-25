import knexInit from 'knex';
import type { Knex } from 'knex';
import { Email } from './types';

export const knex = knexInit({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
});

// Map DB row to Email type (camelCase)
export function mapEmailRow(row: any): Email {
  return {
    id: row.id,
    to: row.to,
    cc: row.cc ?? null,
    bcc: row.bcc ?? null,
    subject: row.subject,
    body: row.body,
    createdAt: row.created_at,
  };
}
