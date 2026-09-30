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

  const dockWos = await knex('dock_work_orders as dwo')
    .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
    .where('dwo.dry_dock_id', dock.id)
    .select('dwo.id', 'wo.job_code', 'wo.job_name');

  const pick = (code, namePrefix) =>
    dockWos.find((r) => r.job_code === code && r.job_name.startsWith(namePrefix));

  const updates = [
    [pick('H002', 'Decking Eng'), 10, 'Initial inspection done.', 'Roshan'],
    [pick('C001', '6 Months Routine'), 80, 'Electro hydraulic controls tested.', 'Mark'],
    [pick('C001', 'Aux. Cooling'), 90, 'Pump motor reinstalled.', 'Raja'],
    [pick('C001', 'Grease of Main AC'), 80, 'Greasing 80% complete.', 'Mark'],
    [pick('H001', '3 Month Routine'), 80, 'Break mechanism greased.', 'Mark'],
    [pick('C001', '2 Months Routine'), 80, 'Anchor windlass greasing ongoing.', 'Mark'],
    [pick('C001', '3 Weeks Greasing'), 60, 'Rope reel greasing in progress.', 'Mark'],
  ];

  const rows = updates
    .filter(([dwo]) => !!dwo)
    .map(([dwo, progress, note, updatedBy]) => ({
      dock_work_order_id: dwo.id,
      progress,
      note,
      updated_by: updatedBy,
      created_at: '2022-10-12 09:00:00',
    }));

  if (rows.length) await knex('wo_updates').insert(rows);
};
