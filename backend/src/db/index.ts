import knexInit from 'knex';

const knex = knexInit({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
});

export type Lead = Record<string, unknown>;

export class DB {
  static async addLead(data: Lead) {
    return knex('leads').insert(data);
  }
}
