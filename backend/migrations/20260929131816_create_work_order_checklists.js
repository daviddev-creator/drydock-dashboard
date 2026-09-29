/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('work_order_checklists', function(table) {
        table.increments('id').primary();
        table.integer('work_order_id').notNullable().unsigned().references('id').inTable('work_orders');
        table.integer('checklist_id').notNullable().unsigned().references('id').inTable('checklists');
        table.text('remarks').nullable();
        table.boolean('completed').defaultTo(false);
        table.datetime('completed_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('work_order_checklists');
};
