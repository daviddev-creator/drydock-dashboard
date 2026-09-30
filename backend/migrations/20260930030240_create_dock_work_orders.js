/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('dock_work_orders', function(table) {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.integer('work_order_id').notNullable().unsigned().references('id').inTable('work_orders');
        table.string('status').defaultTo('Open'); // catatan lagi saja Open, In Progress, On Hold, Complete
        table.string('location').nullable();
        table.integer('sort_order').defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('dock_work_orders');
};
