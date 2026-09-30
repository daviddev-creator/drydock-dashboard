/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.createTable('meetings', (table) => {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.string('title').notNullable();
        table.datetime('meeting_date').nullable();
        table.string('attendees').nullable();
        table.text('notes').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('meetings');
};
