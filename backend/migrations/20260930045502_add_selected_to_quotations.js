/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
    await knex.schema.alterTable('quotations', (table) => {
        table.boolean('selected').defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.alterTable('quotations', (table) => {
        table.dropColumn('selected');
    });
};
