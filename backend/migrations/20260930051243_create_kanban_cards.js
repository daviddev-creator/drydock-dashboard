/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('kanban_cards', (table) => {
        table.increments('id').primary();
        table.string('board').notNullable(); // quotes_pending_approval | pending_yard_quotes | jobs_awaiting_dock
        table.integer('vessel_id').unsigned().references('id').inTable('vessels');
        table.integer('dry_dock_id').unsigned().references('id').inTable('dry_docks');
        table.string('title').notNullable();
        table.text('description').nullable();
        table.integer('sort_order').defaultTo(0);
        table.datetime('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('kanban_cards')
};
