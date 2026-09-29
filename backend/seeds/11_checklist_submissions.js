/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const wo = await knex('work_orders').where('job_code', 'C001').first();
  const checklist = await knex('checklists').where('name', 'Audit Checklist').first();

  if (!wo || !checklist) return;

  const [submissionId] = await knex('work_order_checklists').insert({
    work_order_id: wo.id,
    checklist_id: checklist.id,
    remarks: 'Completed everything on the checklist',
    completed: true,
    completed_at: '2022-11-02 10:50:00',
  });

  const items = await knex('checklist_items').where('checklist_id', checklist.id).orderBy('sort_order');
  const byTitle = Object.fromEntries(items.map(item => [item.title, item.id]));

  await knex('checklist_answers').insert([
    { work_order_checklist_id: submissionId, checklist_item_id: byTitle['Status'], value: 'Complete' },
    { work_order_checklist_id: submissionId, checklist_item_id: byTitle['How many Defects were found'], value: '2' },
    { work_order_checklist_id: submissionId, checklist_item_id: byTitle['Describe the condition of the ballast tank.'], value: 'Ballast tank in good condition, minor coating wear observed.' },
    { work_order_checklist_id: submissionId, checklist_item_id: byTitle['What is the meter Reading for Auxilliary Engine?'], value: '300' },
    { work_order_checklist_id: submissionId, checklist_item_id: byTitle['Which of the following items were consumed?'], value: JSON.stringify(['Grease', 'Filter']) },
  ]);
};
