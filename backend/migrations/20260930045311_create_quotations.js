/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('quotations', (table) => {
        table.increments('id').primary();
        table.integer('rfq_id').notNullable().unsigned().references('id').inTable('rfqs');
        table.integer('shipyard_id').notNullable().unsigned().references('id').inTable('shipyards');
        table.string('quotation_no').nullable();
        table.string('status').defaultTo('Not Sent');     // Not Sent | Sent, Awaiting Quotation | In Quotation (Quotation No.) | Received | Approved | Rejected
        table.decimal('total', 14, 2).defaultTo(0);
        table.datetime('sent_at').nullable();
        table.datetime('quote_date').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
    await knex.schema.dropTableIfExists('quotations');
};
