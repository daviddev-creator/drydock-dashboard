/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('sub_jobs', function(table) {
        table.increments('id').primary();
        table.integer('work_order_id').notNullable().unsigned().references('id').inTable('work_orders');
        table.string('title').notNullable();
        table.text('description').nullable();
        table.string('status').defaultTo('Open');
    }); 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('sub_jobs');
};
