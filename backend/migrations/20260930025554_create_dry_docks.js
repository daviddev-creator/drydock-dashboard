/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('dry_docks', function(table) {
        table.increments('id').primary();
        table.string('dock_no').notNullable();
        table.string('description').nullable();
        table.integer('vessel_id').unsigned().references('id').inTable('vessels');
        table.string('company').nullable();
        table.string('account_code').nullable();
        table.string('responsible_rank').nullable();
        table.decimal('budget', 14, 2).defaultTo(0);
        table.string('currency', 8).defaultTo('USD');
        table.date('planned_start').nullable();
        table.date('planned_end').nullable();
        table.date('actual_start').nullable();
        table.date('actual_end').nullable();
        table.string('priority').defaultTo('Medium'); // Catatan lagi saja High, Medium, Low
        table.string('status').defaultTo('Planning'); // Catatan lagi saja Planning, Execution, Completed
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('dry_docks');
};
