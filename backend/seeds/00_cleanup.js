/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Nonaktifkan aja foreign keynya sementara biar aman seeder nya
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  for (const table of ['vessels', 'shipyards']) {
    if (await knex.schema.hasTable(table)) await knex(table).truncate(); 
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};
