/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('checklist_items', function(table) {
        table.increments('id').primary();
        table.integer('checklist_id').notNullable().unsigned().references('id').inTable('checklists');
        table.string('title').notNullable();
        table.string('data_type').notNullable().defaultTo('text');
        table.text('options').nullable();
        table.integer('sort_order').defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('checklist_items');
};
