/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('vessels').insert([
    {name: 'Ocean Star', imo: '9312345', type: 'Oil Tanker'},
    {name: 'MV Glory', imo: '9312346', type: 'Bulk Carrier'},
    {name: 'MV Happy', imo: '9312347', type: 'Container'},
    {name: 'MV Judas', imo: '9312348', type: 'Bulk Carrier'},
    {name: 'Emma Stone', imo: '9312349', type: 'Oil Tanker'},
    {name: 'Cecilia Stone', imo: '9312350', type: 'Oil Tanker'},
    {name: 'Greenwich', imo: '9312351', type: 'Bulk Carrier'},
    {name: 'Yue Dian', imo: '9312352', type: 'General Cargo'},
  ]);
};
