/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('specification_groups', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('group_no').notNullable();
    table.integer('vessel_id').unsigned().references('id').inTable('vessels');
    table.integer('sort_order').defaultTo(0);
    table.boolean('frontpage').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('specification_groups')
};
