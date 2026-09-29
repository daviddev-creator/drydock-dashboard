/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const vessels = await knex('vessels').select('id', 'name');
  const vessel = Object.fromEntries(vessels.map(v => [v.name, v.id]));

  await knex('specification_groups').insert([
    { name:'General', group_no: 'A1', vessel_id: vessel['Ocean Star'], sort_order: 1, frontpage: true },
    { name:'Hull', group_no: 'B1', vessel_id: vessel['MV Glory'], sort_order: 2, frontpage: true },
    { name:'Machiney Main Component', group_no: 'C1', vessel_id: vessel['MV Glory'], sort_order: 3, frontpage: true },
    { name:'Ship Common System', group_no: 'D1', vessel_id: vessel['MV Glory'], sort_order: 4, frontpage: false },
    { name:'Equipment for Crew', group_no: 'E1', vessel_id: vessel['MV Glory'], sort_order: 5, frontpage: true },
    { name:'Ship Common Systems and Devices', group_no: '12', vessel_id: vessel['MV Glory'], sort_order: 6, frontpage: false },
    { name:'Test Chik', group_no: 'test', vessel_id: vessel['MV Glory'], sort_order: 7, frontpage: false },
  ])
};
