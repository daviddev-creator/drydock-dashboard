/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.createTable('approvals', (table) => {
        table.increments('id').primary();
        table.integer('dry_dock_id').notNullable().unsigned().references('id').inTable('dry_docks');
        table.integer('level').notNullable().defaultTo(1);
        table.string('approver').notNullable();
        table.string('status').defaultTo('Pending');      // Pending | Approved | Rejected
        table.datetime('decided_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.dropTableIfExists('approvals');
};
