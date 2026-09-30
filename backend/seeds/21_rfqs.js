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

  await knex('rfqs').insert([
    { dry_dock_id: dock.id, rfq_no: 'SD10/S/RFQ/17/0057', rfq_date: '2017-06-18', expiry_date: '2017-07-02', comments: 'with class approved certificate' },
    { dry_dock_id: dock.id, rfq_no: 'SD10/S/RFQ/20/0102', rfq_date: '2020-08-20', expiry_date: '2020-09-05', comments: 'Include dock block usage and crane rental' },
  ]);
};
