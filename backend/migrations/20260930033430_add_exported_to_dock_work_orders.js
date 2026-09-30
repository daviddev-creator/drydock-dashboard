/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('dock_work_orders', (table) => {
        table.boolean('exported').defaultTo(false);
        table.integer('version').defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.alterTable('dock_work_orders', (table) => {
        table.dropColumn('exported');
        table.dropColumn('version');
    });
};
