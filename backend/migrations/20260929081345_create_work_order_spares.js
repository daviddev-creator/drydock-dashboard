/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('work_order_spares', (table) => {
        table.increments('id').primary();
        table.integer('work_order_id').notNullable().unsigned().references('id').inTable('work_orders');
        table.integer('spare_id').notNullable().unsigned().references('id').inTable('spares');
        table.decimal('expected_qty', 10, 2).defaultTo(1);
        table.decimal('cost', 14, 2).defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('work_order_spares');
};
