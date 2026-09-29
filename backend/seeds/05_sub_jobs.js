/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const workOrders = await knex('work_orders').select('id', 'job_code', 'job_name').orderBy('id');
  const workOrder = (code, namePrefix) => workOrders.find(wo => wo.job_code === code && wo.job_name.startsWith(namePrefix)); 

  const routine = workOrder('C001', '3 Month Routine');
  const controls = workOrder('C001', '6 Months Routine');
  if (!routine || !controls) return; 

  await knex('sub_jobs').insert([
    { work_order_id: routine.id, title: 'Sub Job 1 - Visual inspection', description: 'Inspect motor body and mounting bolts.', status: 'Open' },
    { work_order_id: routine.id, title: 'Sub Job 2 - Insulation test', description: 'Megger test stator winding.', status: 'In Progress' },
    { work_order_id: controls.id, title: 'Sub Job 5 - Hydraulic controls operate test', description: 'Operate all electro hydraulic controls.', status: 'Open' },
  ]);
};
