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

  const wos = await knex('work_orders').select('id', 'job_code', 'job_name').orderBy('id');
  const wo = (code, namePrefix) =>
    wos.find((r) => r.job_code === code && r.job_name.startsWith(namePrefix));

  await knex('dock_work_orders').insert([
    { dry_dock_id: dock.id, work_order_id: wo('H002', 'Decking Eng').id, status: 'Open', location: 'Buster fuel', sort_order: 1 },
    { dry_dock_id: dock.id, work_order_id: wo('A4', '5 Monthly').id, status: 'Open', location: 'Yokohama Fender crane no.4 (115.041)', sort_order: 2 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '6 Months').id, status: 'On Hold', location: 'Thermal Oil Heater Fuel Oil Booster Pump Motor (109.009.010.001)', sort_order: 3 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '3 Month Routine').id, status: 'On Hold', location: 'Yokohama Fender crane no.4 (115.041)', sort_order: 4 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', 'Aux. Cooling').id, status: 'In Progress', location: 'No.2 Cargo Pump (114.001B)', sort_order: 5 },
    { dry_dock_id: dock.id, work_order_id: wo('H001', '3 Month Routine').id, status: 'On Hold', location: 'j', sort_order: 6 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '2 Months Routine').id, status: 'In Progress', location: 'Yokohama Fender Crane No.2 (115.039)', sort_order: 7 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', 'Grease of Main AC').id, status: 'In Progress', location: 'Thermal Oil Heater Fuel Oil Booster Pump Motor (109.009.010.001)', sort_order: 8 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '3 Week Routine').id, status: 'Complete', location: 'Fire Control Room Supply Fan Motor (117.091.001)', sort_order: 9 },
    { dry_dock_id: dock.id, work_order_id: wo('C001', '3 Weeks Greasing').id, status: 'In Progress', location: 'Thermal Oil Boiler (109.009)', sort_order: 10 },
    { dry_dock_id: dock.id, work_order_id: wo('A5', 'Sub Job 5').id, status: 'Open', location: 'No.1 Cargo Pump (114.001A)', sort_order: 11 },
  ]);
};
