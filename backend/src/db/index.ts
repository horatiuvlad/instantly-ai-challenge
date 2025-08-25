import knexInit from 'knex';

const knex = knexInit({
  client: 'sqlite3',
  connection: {
    // Keep same filename as migration config
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
});

export type Email = {
  id?: number;
  to: string | null;
  cc?: string | null;
  bcc?: string | null;
  subject?: string | null;
  body?: string | null;
  created_at?: string;
  updated_at?: string;
};

export class DB {
  static async listEmails(): Promise<Email[]> {
    return knex<Email>('emails').select('*').orderBy('created_at', 'desc');
  }

  static async getEmail(id: number): Promise<Email | undefined> {
    return knex<Email>('emails').where({ id }).first();
  }

  static async createEmail(data: Omit<Email, 'id' | 'created_at' | 'updated_at'>): Promise<Email> {
    const [id] = await knex('emails').insert(data);
    const created = await this.getEmail(Number(id));
    // sqlite3 returns rowid; ensure object
    return created as Email;
  }

  static async updateEmail(id: number, data: Partial<Email>): Promise<Email | undefined> {
    await knex('emails').where({ id }).update({ ...data, updated_at: knex.fn.now() });
    return this.getEmail(id);
  }

  static async deleteEmail(id: number): Promise<number> {
    return knex('emails').where({ id }).del();
  }
}

export default knex;
