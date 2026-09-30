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

  await knex('meetings').insert([
    { dry_dock_id: dock.id, title: 'Pre-docking meeting', meeting_date: '2020-09-01 09:00:00', attendees: 'Roshan, Raja, Yard Manager', notes: 'Confirm docking plan and stability calculation.' },
    { dry_dock_id: dock.id, title: 'Weekly progress meeting', meeting_date: '2020-09-15 14:00:00', attendees: 'Superintendent, C/E, 2/E', notes: 'Hull blasting ahead of schedule; BWT change to start next week.' },
  ]);
};
