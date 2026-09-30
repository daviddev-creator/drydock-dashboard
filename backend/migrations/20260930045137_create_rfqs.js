/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('rfqs', (table) => {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.string('rfq_no').notNullable();
        table.date('rfq_date').nullable();
        table.date('expiry_date').nullable();
        table.text('comments').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.dropTableIfExists('rfqs');
};
