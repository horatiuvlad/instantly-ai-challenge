// Knex configuration for CLI (CommonJS because project is ESM)
/** @type {import('knex').Knex.Config} */
module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
    extension: 'cjs',
  },
};
