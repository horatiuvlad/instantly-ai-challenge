import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
});

class DB {
  static async addLead(data) {
    return db('leads').insert(data);
  }

  // Email operations
  static async getAllEmails() {
    return db('emails')
      .select('*')
      .orderBy('created_at', 'desc');
  }

  static async getEmailById(id) {
    return db('emails')
      .where({ id })
      .first();
  }

  static async createEmail(emailData) {
    const [id] = await db('emails').insert({
      to: emailData.to,
      cc: emailData.cc || null,
      bcc: emailData.bcc || null,
      subject: emailData.subject,
      body: emailData.body,
    });
    return this.getEmailById(id);
  }

  static async updateEmail(id, emailData) {
    await db('emails')
      .where({ id })
      .update({
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        body: emailData.body,
        updated_at: db.fn.now(),
      });
    return this.getEmailById(id);
  }

  static async deleteEmail(id) {
    return db('emails')
      .where({ id })
      .del();
  }
}

export { DB, db };
