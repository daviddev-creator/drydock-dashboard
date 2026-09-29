/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('attachments', (table) => {
        table.increments('id').primary();
        table.string('file_name').notNullable();
        table.boolean('include_in_specs').defaultTo(false);
        table.integer('work_order_id').unsigned().references('id').inTable('work_orders');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('attachments');
};
