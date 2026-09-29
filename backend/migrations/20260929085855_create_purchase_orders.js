/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('purchase_orders', (table) => {
        table.increments('id').primary();
        table.string('po_no').notNullable();
        table.string('supplier').nullable();
        table.decimal('total', 14, 2).defaultTo(0);
        table.string('category').defaultTo('Inventory'); // adanya: Inventory, Spare Part, Machinery
        table.string('status').defaultTo('Open');
        table.integer('work_order_id').unsigned().references('id').inTable('work_orders');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('purchase_orders');
};
