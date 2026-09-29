/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

exports.seed = async function seed(knex) {
  await knex('spares').insert([
    { name: 'GASKET, ROCKER LEVER COVER', part_no: 'GT-8811' },
    { name: 'SEAL O RING (No.20)', part_no: 'OR-020' },
    { name: 'SEAL O RING (No.19)', part_no: 'OR-019' },
    { name: 'GASKET, RKR LEVER HOUSING', part_no: 'GT-9020' },
  ]);

  const allSpares = await knex('spares').select('id', 'name');
  const spMap = Object.fromEntries(allSpares.map((s) => [s.name, s.id]));

  const wo = await knex('work_orders').where('job_code', 'C001').first();
  if (!wo) return;

  await knex('work_order_spares').insert([
    { work_order_id: wo.id, spare_id: spMap['GASKET, ROCKER LEVER COVER'], expected_qty: 1, cost: 12 },
    { work_order_id: wo.id, spare_id: spMap['SEAL O RING (No.20)'], expected_qty: 2, cost: 56 },
    { work_order_id: wo.id, spare_id: spMap['SEAL O RING (No.19)'], expected_qty: 2, cost: 45 },
    { work_order_id: wo.id, spare_id: spMap['GASKET, RKR LEVER HOUSING'], expected_qty: 2, cost: 900 },
  ]);
};
