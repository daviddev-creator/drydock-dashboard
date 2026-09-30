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

  await knex('daily_reports').insert([
    { dry_dock_id: dock.id, title: 'Daily', author: 'Roshan', report_date: '2022-10-11', content: 'Hull blasting 40% complete. BWT valve replacement started.' },
    { dry_dock_id: dock.id, title: 'Daily Report', author: 'Roshan', report_date: '2022-10-12', content: 'Aux engine overhauled. Crane load test scheduled tomorrow.' },
  ]);
};
