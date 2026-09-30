/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const vessels = await knex('vessels').select('id', 'name');
  const v = Object.fromEntries(vessels.map(vessel => [vessel.name, vessel.id]));
  const hasShipyard = await knex.schema.hasColumn('dry_docks', 'shipyard_id');
  const shipyards = hasShipyard ? await knex('shipyards').select('id', 'name') : [];
  const s = Object.fromEntries(shipyards.map(shipyard => [shipyard.name, shipyard.id]));

  const docks = [
    { dock_no: 'SEPT2020/DD1', description: 'DD Required to change BWT', vessel_id: v['Ocean Star'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-123', responsible_rank: 'Raja/CO', budget: 300000, currency: 'USD', planned_start: '2020-09-01', planned_end: '2020-09-25', actual_start: '2020-09-02', actual_end: null, shipyard_name: 'Bombay Dockyard', priority: 'High', status: 'Planning' },
    { dock_no: 'SEPT2020/DD1', description: 'DD Required to change BWT', vessel_id: v['MV Glory'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-123', responsible_rank: 'Raja/CO', budget: 300000, currency: 'USD', planned_start: '2020-09-10', planned_end: '2020-10-05', actual_start: '2020-09-12', actual_end: null, shipyard_name: null, priority: 'Medium', status: 'Planning' },
    { dock_no: 'OCT2020DD2', description: 'DD Needed to change OIL TANK', vessel_id: v['MV Happy'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 420000, currency: 'USD', planned_start: '2020-10-01', planned_end: '2020-10-30', actual_start: '2020-10-02', actual_end: null, shipyard_name: 'Hindustan Shipyard Limited', priority: 'High', status: 'Execution' },
    { dock_no: 'OCT2020DD2', description: 'DD to repair cranes', vessel_id: v['MV Judas'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 260000, currency: 'USD', planned_start: '2020-10-05', planned_end: '2020-11-02', actual_start: null, actual_end: null, shipyard_name: 'Timblo Drydocks Private Limited', priority: 'Medium', status: 'Planning' },
    { dock_no: 'OCT2020DD2', description: 'DD Required to change BWT', vessel_id: v['Emma Stone'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 310000, currency: 'USD', planned_start: '2020-10-08', planned_end: '2020-11-05', actual_start: null, actual_end: null, shipyard_name: 'Hindustan Shipyard Limited', priority: 'Low', status: 'Planning' },
    { dock_no: 'OCT2020DD2', description: 'DD Needed to change OIL TANK', vessel_id: v['Cecilia Stone'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 305000, currency: 'USD', planned_start: '2020-10-10', planned_end: '2020-11-08', actual_start: null, actual_end: null, shipyard_name: 'Hindustan Shipyard Limited', priority: 'Medium', status: 'Planning' },
    { dock_no: 'OCT2020DD2', description: 'DD to repair cranes', vessel_id: v['Greenwich'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 240000, currency: 'USD', planned_start: '2020-10-12', planned_end: '2020-11-10', actual_start: null, actual_end: null, shipyard_name: 'Bombay Dockyard', priority: 'Medium', status: 'Planning' },
    { dock_no: 'OCT2020DD2', description: 'DD to change navigation equipment', vessel_id: v['Yue Dian'], company: 'Acme Ship Managers Pte Ltd.', account_code: 'ABC-456', responsible_rank: 'Raja/CO', budget: 180000, currency: 'USD', planned_start: '2020-10-15', planned_end: '2020-11-12', actual_start: null, actual_end: null, shipyard_name: 'Timblo Drydocks Private Limited', priority: 'Low', status: 'Planning' },
  ];

  await knex('dry_docks').insert(
    docks.map((d) => {
      const { shipyard_name, ...row } = d;
      if (hasShipyard) {
        row.shipyard_id = shipyard_name ? (s[shipyard_name] || null) : null;
      }
      return row;
    })
  );
};
