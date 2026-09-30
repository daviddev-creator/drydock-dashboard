/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function seed(knex) {
  const vessels = await knex('vessels').select('id', 'name');
  const v = Object.fromEntries(vessels.map((r) => [r.name, r.id]));
  const docks = await knex('dry_docks as dd')
    .join('vessels as vl', 'dd.vessel_id', 'vl.id')
    .select('dd.id', 'vl.name as vessel_name')
    .orderBy('dd.id');
  const dockOrder = docks.map((d) => d.id);

  const quoteCards = [
    ['Ocean Star', 'Kempell', 'SEPT2020/DD1'],
    ['MV Glory', 'Bombay Dockyard', 'SEPT2020/DD1'],
    ['MV Happy', 'Hindustan Shipyard Limited', 'OCT2020DD2'],
    ['MV Judas', 'Timblo Drydocks Private Limited', 'OCT2020DD2'],
    ['Emma Stone', 'Hindustan Shipyard Limited', 'OCT2020DD2'],
    ['Cecilia Stone', 'Hindustan Shipyard Limited', 'OCT2020DD2'],
    ['Greenwich', 'Bombay Dockyard', 'OCT2020DD2'],
    ['Yue Dian', 'Timblo Drydocks Private Limited', 'OCT2020DD2'],
  ];

  const rows = [];
  for (const board of ['quotes_pending_approval', 'pending_yard_quotes']) {
    quoteCards.forEach(([vessel, title, description], i) => {
      rows.push({ board, vessel_id: v[vessel], title, description, sort_order: i });
    });
  }
  const jobCards = [
    ['5 Monthly check of Auxiliary engine', 'C001 PMS Job'],
    ['3 Month Routine Check and Inspection El. Motor', 'C001.003 UPM Job'],
    ['3 Month Routine Check and Inspection El. Motor', 'C001 PMS Job'],
    ['2 Months Routine for Greasing of Anchor Windlass/Towing Winch', 'C001.002 PMS Job'],
    ['Decking Eng', 'UYU789 Time'],
    ['3 Month Routine Check and Inspection El. Motor', 'C001.004 Dock Job'],
    ['Sub Job 5', 'C001.004 Dock Job'],
    ['Grease of Main AC FW Cooling Pump', 'C001 Dock Job'],
    ['6 Months Routine Check and Operate The Electro Hydraulic Controls', 'C001 Dock Job'],
    ['3 Week Routine Greasing of Tugger Winch Emergency Break', 'C001 Dock Job'],
    ['2 Months Routine for Greasing of Anchor Windlass/Towing Winch', 'C001 Dock Job'],
    ['3 Weeks Greasing Rope Reel', 'C001 Dock Job'],
  ];
  const dockFor = (i) => dockOrder[i < 3 ? 0 : i < 5 ? 1 : 2] ?? dockOrder[0];
  jobCards.forEach(([title, description], i) => {
    rows.push({ board: 'jobs_awaiting_dock', dry_dock_id: dockFor(i), title, description, sort_order: i });
  });

  await knex('kanban_cards').insert(rows);
};
