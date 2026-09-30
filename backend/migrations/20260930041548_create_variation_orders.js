/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('variation_orders', (table) => {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.integer('work_order_id').unsigned().references('id').inTable('work_orders');
        table.string('title').notNullable();
        table.decimal('cost', 14, 2).defaultTo(0);
        table.string('status').defaultTo('Open');         // Open | In Progress | On Hold | Complete
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('variation_orders');
};
