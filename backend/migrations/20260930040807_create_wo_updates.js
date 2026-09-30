/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('wo_updates', (table) => {
        table.increments('id').primary();
        table.integer('dock_work_order_id').notNullable().unsigned().references('id').inTable('dock_work_orders');
        table.integer('progress').defaultTo(0);           // 0 - 100
        table.text('note').nullable();
        table.string('updated_by').nullable();
        table.datetime('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('wo_updates');
};
