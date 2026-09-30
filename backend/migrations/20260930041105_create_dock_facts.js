/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.createTable('dock_facts', (table) => {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.string('fact_key').notNullable();           // arriving_dock, vessel_on_blocks, ...
        table.datetime('occurred_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('dock_facts');
};
