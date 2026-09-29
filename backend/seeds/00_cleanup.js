/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Nonaktifkan aja foreign keynya sementara biar aman seeder nya
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};
