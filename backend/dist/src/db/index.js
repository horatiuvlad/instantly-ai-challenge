import knexInit from 'knex';
const knex = knexInit({
    client: 'sqlite3',
    connection: {
        // Keep same filename as migration config
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
});
export class DB {
    static async listEmails() {
        return knex('emails').select('*').orderBy('created_at', 'desc');
    }
    static async getEmail(id) {
        return knex('emails').where({ id }).first();
    }
    static async createEmail(data) {
        const [id] = await knex('emails').insert(data);
        const created = await this.getEmail(Number(id));
        // sqlite3 returns rowid; ensure object
        return created;
    }
    static async updateEmail(id, data) {
        await knex('emails').where({ id }).update({ ...data, updated_at: knex.fn.now() });
        return this.getEmail(id);
    }
    static async deleteEmail(id) {
        return knex('emails').where({ id }).del();
    }
}
export default knex;
