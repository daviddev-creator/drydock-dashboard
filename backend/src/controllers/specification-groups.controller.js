const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

// list data
exports.index = asyncHandler(async (req, res) => {
    const q = req.query.q || '';
    let query = knex('specification_groups as sg')
        .leftJoin('vessels as v', 'sg.vessel_id', 'v.id')
        .select('sg.*', 'v.name as vessel_name');
    if (q) query = query.where((w) => 
        w.where('sg.name', 'like', `%${q}%`)
        .orWhere('sg.group_no', 'like', `%${q}%`)
        .orWhere('v.name', 'like', `%${q}%`));
    ok(res, await query.orderBy('sg.sort_order'));
});

// show data
exports.show = asyncHandler(async (req, res) => {
    const row = await knex('specification_groups as sg')
        .leftJoin('vessels as v', 'sg.vessel_id', 'v.id')
        .where('sg.id', req.params.id)
        .select('sg.*', 'v.name as vessel_name')
        .first();
    if (!row) throw new ApiError(404, 'Specification group tidak di temukan');
    ok(res, row);
});

// tambah data
exports.store = asyncHandler(async (req, res) => {
    const [id] = await knex('specification_groups').insert({
        name: req.body.name,
        group_no: req.body.group_no,
        vessel_id: req.body.vessel_id,
        sort_order: req.body.sort_order || 0,
        frontpage: req.body.frontpage || false
    });
    ok(res, { id }, 201);
});

// edit data

exports.update = asyncHandler(async (req, res) => {
    const count = await knex('specification_groups').where('id', req.params.id).update({
        name: req.body.name,
        group_no: req.body.group_no,
        vessel_id: req.body.vessel_id,
        sort_order: req.body.sort_order || 0,
        frontpage: req.body.frontpage || false
    });
    if (!count) throw new ApiError(404, 'Specification group tidak di temukan');
    ok(res, { id: Number(req.params.id) });
});

// hapus data
exports.destroy = asyncHandler(async (req, res) => {
    await knex('specification_groups').where('id', req.params.id).del();
    ok(res, { deleted: true });
});