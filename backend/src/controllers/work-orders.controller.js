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

    // Ambil semua data anak secara paralel
    const [subJobs, spares, attachments, tasks, purchaseOrders] = await Promise.all([
        knex('sub_jobs').where('work_order_id', wo.id).orderBy('id'),
        knex('work_order_spares as ws')
        .join('spares as s', 'ws.spare_id', 's.id')
        .where('ws.work_order_id', wo.id)
        .select('ws.id', 's.name', 'ws.expected_qty', 'ws.cost'),
        knex('attachments').where('work_order_id', wo.id),
        knex('tasks').where('work_order_id', wo.id).orderBy('id'),
        knex('purchase_orders').where('work_order_id', wo.id).orderBy('id'),
    ]);

    ok(res, {
        ...wo,
        sub_jobs: subJobs,
        spares,
        attachments,
        tasks,
        purchase_orders: purchaseOrders,
        checklists: [] // Akan kita isi di modul berikutnya (Checklist)
    });
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

// tambah sub job
exports.addSubJob = asyncHandler(async (req, res) => {
    const [id] = await knex('sub_jobs').insert({
        work_order_id: req.params.id,
        title: req.body.title,
        description: req.body.description || null,
        status: req.body.status || 'Open',
    });
    ok(res, { id }, 201);
});

//edit sub job
exports.updateSubJob = asyncHandler(async (req, res) => {
    await knex('sub_jobs').where({ id: req.params.subId, work_order_id: req.params.id }).update(req.body);
    ok(res, { id: Number(req.params.subId) });
});

//hapus sub job
exports.deleteSubJob = asyncHandler(async (req, res) => {
    await knex('sub_jobs').where({ id: req.params.subId, work_order_id: req.params.id }).del();
    ok(res, { deleted: true });
});

//tambah spare part
exports.addSpare = asyncHandler(async (req, res) => {
    let spareId = req.body.spare_id;
    if (!spareId && req.body.name) {
        [spareId] = await knex('spares').returning('id').insert({ name: req.body.name, part_no: req.body.part_no || null });
    }
    const [id] = await knex('work_order_spares').insert({
        work_order_id: req.params.id, spare_id: spareId,
        expected_qty: req.body.expected_qty ?? 1, cost: req.body.cost ?? 0,
    });
    ok(res, { id }, 201);   
});

// hapus spare part
exports.deleteSpare = asyncHandler(async (req, res) => {
    await knex('work_order_spares').where({ id: req.params.rowId, work_order_id: req.params.id }).del();
    ok(res, { deleted: true });
});

// tambah file attachment
exports.addAttachment = asyncHandler(async (req, res) => {
    const [id] = await knex('attachments').insert({
        file_name: req.body.file_name, include_in_specs: !!req.body.include_in_specs,
        work_order_id: req.params.id,
    });
    ok(res, { id }, 201);
});

// update file attachment
exports.updateAttachment = asyncHandler(async (req, res) => {
    await knex('attachments').where({ id: req.params.rowId, work_order_id: req.params.id }).update(req.body);
    ok(res, { id: Number(req.params.rowId) });
})

// hapus file attachment
exports.deleteAttachment = asyncHandler(async (req, res) => {
    await knex('attachments').where({ id: req.params.rowId, work_order_id: req.params.id }).del();
    ok(res, { deleted: true });
})

exports.addPurchaseOrder = asyncHandler(async (req, res) => {
    const [id] = await knex('purchase_orders').insert({
        work_order_id: req.params.id,
        po_no: req.body.po_no,
        supplier: req.body.supplier || null,
        total: req.body.total ?? 0,
        category: req.body.category || 'Inventory',
    });
    ok(res, { id }, 201);
});