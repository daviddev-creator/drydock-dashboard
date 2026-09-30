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

  await knex('approvals').insert([
    { dry_dock_id: dock.id, level: 1, approver: 'Hari', status: 'Approved', decided_at: '2020-09-03 08:00:00' },
    { dry_dock_id: dock.id, level: 2, approver: 'Raja', status: 'Pending' },
    { dry_dock_id: dock.id, level: 3, approver: 'Roshan', status: 'Pending' },
  ]);
};
