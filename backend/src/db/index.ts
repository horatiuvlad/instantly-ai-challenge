import knexInit from 'knex';

const knex = knexInit({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
});

export interface Email {
  id?: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export class DB {
  static async getEmails(): Promise<Email[]> {
    return knex('emails').select('*').orderBy('created_at', 'desc');
  }

  static async getEmailById(id: number): Promise<Email | undefined> {
    return knex('emails').where('id', id).first();
  }

  static async createEmail(data: Omit<Email, 'id' | 'created_at' | 'updated_at'>): Promise<number[]> {
    return knex('emails').insert(data);
  }

  static async updateEmail(id: number, data: Partial<Omit<Email, 'id' | 'created_at' | 'updated_at'>>): Promise<number> {
    return knex('emails').where('id', id).update(data);
  }

  static async deleteEmail(id: number): Promise<number> {
    return knex('emails').where('id', id).del();
  }
}
