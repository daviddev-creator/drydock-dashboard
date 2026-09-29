/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('work_orders', function(table) {
        table.increments('id').primary();
        table.string('job_code').notNullable();
        table.string('job_name').notNullable();
        table.text('description').nullable();
        table.string('job_category').nullable(); // cuma ada check, repair, greasing
        table.string('job_type').notNullable().defaultTo('PMS Job'); // dari awal saat liat cuma ada 3 pms jon, dock job dan upm job, ini catatan untuk gak lupa
        table.boolean('critical_job').defaultTo(false);
        table.boolean('internal_job').defaultTo(false);
        table.integer('estimated_hours').defaultTo(0);
        table.string('machinery_group').nullable();
        table.string('responsible_rank').nullable();
        table.decimal('budget', 14, 2).defaultTo(0);
        table.decimal('internal_estimate', 14, 2).defaultTo(0);
        table.integer('vessel_id').unsigned().references('id').inTable('vessels');
        table.integer('spec_group_id').unsigned().references('id').inTable('specification_groups');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('work_orders');
};
