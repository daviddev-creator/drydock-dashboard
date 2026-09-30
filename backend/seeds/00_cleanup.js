/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function seed(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  const tables = [
    'kanban_cards',
    'checklist_answers',
    'work_order_checklists',
    'checklist_items',
    'checklists',
    'wo_updates',
    'dock_work_orders',
    'variation_orders',
    'daily_reports',
    'meetings',
    'dock_facts',
    'approvals',
    'quotations',
    'rfqs',
    'tasks',
    'purchase_orders',
    'attachments',
    'work_order_spares',
    'spares',
    'sub_jobs',
    'work_orders',
    'specification_groups',
    'dry_docks',
    'shipyards',
    'vessels',
  ];

  for (const table of tables) {
    const exists = await knex.schema.hasTable(table);
    if (exists) {
      await knex(table).truncate();
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};
