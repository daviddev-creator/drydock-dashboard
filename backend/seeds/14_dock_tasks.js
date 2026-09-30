/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const dock = await knex('dry_docks as dd')
    .join('vessels as v', 'dd.vessel_id', 'v.id')
    .where('v.name', 'MV Glory')
    .first('dd.id');
  if (!dock) return;

  await knex('tasks').insert([
    { dry_dock_id: dock.id, title: 'Arrange shore pass for crew', responsibility: 'Roshan', due_date: '2020-09-05', status: 'Open', description: 'Coordinate with yard security office.' },
    { dry_dock_id: dock.id, title: 'Submit dock plan revision', responsibility: 'Raja', due_date: '2020-09-03', status: 'Closed', dry_dock_id: dock.id, description: 'Revision 2 approved by dock master.' },
  ]);
};
