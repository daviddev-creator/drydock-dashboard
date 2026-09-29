/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('vessels', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('imo').nullable();
    table.string('type').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('vessels');
};
