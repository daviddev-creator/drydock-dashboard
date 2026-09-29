const { asyncHandler, ok } = require('../utils');
const knex = require('../db');

exports.vessels = asyncHandler(async (req, res) => {
  ok(res, await knex('vessels').orderBy('name'));
});

exports.shipyards = asyncHandler(async (req, res) => {
  ok(res, await knex('shipyards').orderBy('name'));
});