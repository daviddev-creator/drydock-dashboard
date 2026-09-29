/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const workOrder = await knex('work_orders').where('job_code', 'C001').first();
  if (!workOrder) return;

  await knex('attachments').insert([
    { file_name: 'Procedure.pdf', include_in_specs: true, work_order_id: workOrder.id },
    { file_name: 'IMG12.JPG', include_in_specs: true, work_order_id: workOrder.id },
    { file_name: 'Findings.docx', include_in_specs: false, work_order_id: workOrder.id },
    { file_name: 'Ship Image', include_in_specs: true, work_order_id: workOrder.id },
  ]);
};
