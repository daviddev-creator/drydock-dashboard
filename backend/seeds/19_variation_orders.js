/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function seed(knex) {
  const dock = await knex('dry_docks as dd')
    .join('vessels as v', 'dd.vessel_id', 'v.id')
    .where('v.name', 'MV Glory')
    .first('dd.id');
  if (!dock) return;

  const wos = await knex('work_orders').select('id', 'job_code', 'job_name').orderBy('id');
  const wo = (code, namePrefix) =>
    wos.find((r) => r.job_code === code && r.job_name.startsWith(namePrefix));

  await knex('variation_orders').insert([
    { dry_dock_id: dock.id, work_order_id: wo('C001', '3 Month Routine').id, title: 'Additional welding on crane pedestal', cost: 8500, status: 'Open' },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '6 Months').id, title: 'Extra blasting area hull aft', cost: 4200, status: 'In Progress' },
  ]);
};