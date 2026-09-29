/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('checklist_answers', function(table) {
        table.increments('id').primary();
        table.integer('work_order_checklist_id').notNullable().unsigned().references('id').inTable('work_order_checklists');
        table.integer('checklist_item_id').notNullable().unsigned().references('id').inTable('checklist_items');
        table.text('value').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('checklist_answers');
};
