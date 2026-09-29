/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const workOrder = await knex('work_orders').where('job_code', 'C001').first();
  if (!workOrder) return;

  const LOREM = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC.';

  await knex('tasks').insert([
    { title: 'VISA Requirement', responsibility: 'Roshan', due_date: '2022-10-10', status: 'Open', description: LOREM, work_order_id: workOrder.id },
    { title: 'Permit Requirement', responsibility: 'Joanne', due_date: '2022-10-10', status: 'Open', description: LOREM, work_order_id: workOrder.id },
    { title: 'Agency Requirement', responsibility: 'Raja', due_date: '2022-10-10', status: 'Closed', description: LOREM, work_order_id: workOrder.id },
    { title: 'Ceritificate Requirement', responsibility: 'Sabari', due_date: '2022-10-10', status: 'In Progress', description: LOREM, work_order_id: workOrder.id },
  ]);
};
