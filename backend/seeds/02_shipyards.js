/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('shipyards').insert([
    {name: 'Kempell', country: 'Finland'},
    {name: 'Bombay Dockyard', country: 'India'},
    {name: 'Hindustan Shipyard Limited', country: 'India'},
    {name: 'Timblo Drydocks Private Limited', country: 'India'},
  ]);
};
