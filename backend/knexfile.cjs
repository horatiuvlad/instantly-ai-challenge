// Knex configuration for local SQLite database used by migrations
/** @type {import('knex').Knex.Config} */
module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
  },
};
