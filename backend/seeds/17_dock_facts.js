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

  const facts = [
    'arriving_dock', 'bow_entering', 'gate_closed', 'emptying_dock', 'vessel_on_blocks',
    'dry_dock', 'flooding_dock', 'gate_opened', 'dock_master_onboard', 'undocking',
    'leaving_yard', 'dock_master_onboard_out', 'alongside_from', 'alongside_to',
  ];

  await knex('dock_facts').insert(
    facts.map((fact_key, i) => ({
      dry_dock_id: dock.id,
      fact_key,
      occurred_at: i < 5 ? `2020-09-1${i} 08:00:00` : null,
    })),
  );
};
