/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('emails', table => {
        table.increments('id').primary();
        table.text('to').notNullable();
        table.text('cc').nullable();
        table.text('bcc').nullable();
        table.string('subject').notNullable();
        table.text('body').notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('emails');
};

