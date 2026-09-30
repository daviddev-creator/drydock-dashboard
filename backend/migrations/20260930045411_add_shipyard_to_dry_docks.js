/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.alterTable('dry_docks', (table) => {
        table.integer('shipyard_id').unsigned().references('id').inTable('shipyards');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.alterTable('dry_docks', (table) => {
        table.dropForeign('shipyard_id');
        table.dropColumn('shipyard_id');
    });
};
