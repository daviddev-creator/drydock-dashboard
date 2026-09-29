/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('tasks', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.string('responsibility').nullable();
        table.date('due_date').nullable();
        table.string('status').defaultTo('Open'); //adanya hanya Open, In Progress, Closed
        table.integer('work_order_id').unsigned().references('id').inTable('work_orders');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('tasks');
};
