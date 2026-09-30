/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.alterTable('attachments', (table) => {
        table.integer('dry_dock_id').unsigned().references('id').inTable('dry_docks');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.alterTable('attachments', (table) => {
        table.dropForeign('dry_dock_id');
        table.dropColumn('dry_dock_id');
    });
};
