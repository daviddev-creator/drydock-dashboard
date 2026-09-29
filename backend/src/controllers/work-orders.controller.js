const { asyncHandler, ok, ApiError } = require('../utils');

const knex = require('../db');

// list data
exports.index = asyncHandler(async (req, res) => {
    let query = knex('work_orders as wo')
        .leftJoin('specification_groups as sg', 'wo.spec_group_id', 'sg.id')
        .leftJoin('vessels as v', 'wo.vessel_id', 'v.id')
        .select('wo.*', 'sg.name as spec_group_name', 'sg.group_no', 'v.name as vessel_name');

    if (req.query.q) {
        query = query.where('wo.job_name', 'like', `%${req.query.q}%`)
        .orWhere('wo.job_code', 'like', `%${req.query.q}%`);
    }
    if (req.query.group_id) query = query.where('wo.spec_group_id', req.query.group_id);
    ok(res, await query.orderBy('sg.sort_order').orderBy('wo.id'));
});

// show data
exports.show = asyncHandler(async (req, res) => {
    const wo = await knex('work_orders as wo')
        .leftJoin('specification_groups as sg', 'wo.spec_group_id', 'sg.id')
        .leftJoin('vessels as v', 'wo.vessel_id', 'v.id')
        .where('wo.id', req.params.id)
        .select('wo.*', 'sg.name as spec_group_name', 'v.name as vessel_name')
        .first();
    if (!wo) throw new ApiError(404, 'Work order tidak ditemukan');
    ok(res, wo);
});

// tambah data
exports.store = asyncHandler(async (req, res) => {
    const b = req.body;
    const [id] = await knex('work_orders').insert({
        job_code: b.job_code, job_name: b.job_name, description: b.description || null,
        job_category: b.job_category || null, job_type: b.job_type || 'PMS Job',
        critical_job: !!b.critical_job, internal_job: !!b.internal_job,
        estimated_hours: b.estimated_hours ?? 0, machinery_group: b.machinery_group || null,
        machinery: b.machinery || null, responsible_rank: b.responsible_rank || null,
        budget: b.budget ?? 0, internal_estimate: b.internal_estimate ?? 0,
        vessel_id: b.vessel_id || null, spec_group_id: b.spec_group_id || null,
    });
    ok(res, { id }, 201);
});

// edit data
exports.update = asyncHandler(async (req, res) => {
    const b = req.body;
    const allowed = {};
    for (const key of ['job_code', 'job_name', 'description', 'job_category', 'job_type', 'machinery_group', 'machinery', 'responsible_rank']) {
        if (b[key] !== undefined) allowed[key] = b[key];
    }
    for (const key of ['critical_job', 'internal_job']) if (b[key] !== undefined) allowed[key] = !!b[key];
    for (const key of ['estimated_hours', 'budget', 'internal_estimate', 'vessel_id', 'spec_group_id']) {
        if (b[key] !== undefined) allowed[key] = b[key];
    }
    const count = await knex('work_orders').where('id', req.params.id).update(allowed);
    if (!count) throw new ApiError(404, 'Work order tidak ditemukan');
    ok(res, { id: Number(req.params.id) });
});

// hapus data
exports.destroy = asyncHandler(async (req, res) => {
    await knex('work_orders').where('id', req.params.id).del();
    ok(res, { deleted: true });
});