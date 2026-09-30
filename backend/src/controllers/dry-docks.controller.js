const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

// lihat data
exports.index = asyncHandler(async (req, res) => {
    let query = knex('dry_docks as dd')
        .leftJoin('vessels as v', 'dd.vessel_id', 'v.id');
    if (await knex.schema.hasColumn('dry_docks', 'shipyard_id')) {
        query = query.leftJoin('shipyards as sy', 'dd.shipyard_id', 'sy.id')
        .select('dd.*', 'v.name as vessel_name', 'sy.name as shipyard_name');
    } else {
        query = query.select('dd.*', 'v.name as vessel_name');
    }
    if (req.query.q) {
        query = query.where((w) =>
        w.where('dd.dock_no', 'like', `%${req.query.q}%`)
            .orWhere('dd.description', 'like', `%${req.query.q}%`)
            .orWhere('v.name', 'like', `%${req.query.q}%`));
    }
    if (req.query.status) query = query.where('dd.status', req.query.status);
    ok(res, await query.orderBy('dd.id'));
});

// show data
exports.show = asyncHandler(async (req, res) => {
    let query = knex('dry_docks as dd')
        .leftJoin('vessels as v', 'dd.vessel_id', 'v.id')
        .where('dd.id', req.params.id);
    if (await knex.schema.hasColumn('dry_docks', 'shipyard_id')) {
        query = query.leftJoin('shipyards as sy', 'dd.shipyard_id', 'sy.id')
        .select('dd.*', 'v.name as vessel_name', 'sy.name as shipyard_name');
    } else {
        query = query.select('dd.*', 'v.name as vessel_name');
    }
    const dock = await query.first();
    if (!dock) throw new ApiError(404, 'Dry dock tidak ditemukan');
    ok(res, dock);
});

//tambah data
exports.store = asyncHandler(async (req, res) => {
    const b = req.body;
    const [id] = await knex('dry_docks').insert({
        dock_no: b.dock_no, description: b.description || null, vessel_id: b.vessel_id || null,
        company: b.company || null, account_code: b.account_code || null,
        responsible_rank: b.responsible_rank || null, budget: b.budget ?? 0,
        currency: b.currency || 'USD', planned_start: b.planned_start || null,
        planned_end: b.planned_end || null, actual_start: b.actual_start || null,
        actual_end: b.actual_end || null, shipyard_id: b.shipyard_id || null,
        priority: b.priority || 'Medium', status: b.status || 'Planning',
    });
    ok(res, { id }, 201);
});

//ubah data
exports.update = asyncHandler(async (req, res) => {
    const b = req.body;
    const allowed = {};
    for (const key of ['dock_no', 'description', 'company', 'account_code', 'responsible_rank', 'currency', 'planned_start', 'planned_end', 'actual_start', 'actual_end', 'priority', 'status']) {
        if (b[key] !== undefined) allowed[key] = b[key];
    }
    for (const key of ['budget', 'vessel_id', 'shipyard_id']) if (b[key] !== undefined) allowed[key] = b[key];
    const count = await knex('dry_docks').where('id', req.params.id).update(allowed);
    if (!count) throw new ApiError(404, 'Dry dock tidak ditemukan');
    ok(res, { id: Number(req.params.id) });
});

// hapus daa
exports.destroy = asyncHandler(async (req, res) => {
    await knex('dry_docks').where('id', req.params.id).del();
    ok(res, { deleted: true });
});

// get data spec wo di dock
exports.workOrders = asyncHandler(async (req, res) => {
    const rows = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .leftJoin('specification_groups as sg', 'wo.spec_group_id', 'sg.id')
        .where('dwo.dry_dock_id', req.params.id)
        .select(
        'dwo.id as dock_wo_id', 'dwo.status', 'dwo.location', 'dwo.sort_order',
        'dwo.exported', 'dwo.version', 'wo.*', 'sg.name as spec_group_name',
        )
        .orderBy('dwo.sort_order');
    ok(res, rows);
});

// tambah data spec wo di dock
exports.addWorkOrder = asyncHandler(async (req, res) => {
    const dock = await knex('dry_docks').where('id', req.params.id).first();
    if (!dock) throw new ApiError(404, 'Dry dock tidak ditemukan');

    let woId = req.body.work_order_id;
    if (!woId && req.body.job_name) {
        const [row] = await knex('work_orders').returning('id').insert({
        job_code: req.body.job_code || 'NEW',
        job_name: req.body.job_name,
        job_type: req.body.job_type || 'Dock Job',
        vessel_id: dock.vessel_id,
        });
        woId = row.id ?? row;
    }
    if (!woId) throw new ApiError(400, 'work_order_id atau job_name wajib diisi');

    const max = await knex('dock_work_orders').where('dry_dock_id', req.params.id).max('sort_order as m').first();
    const [id] = await knex('dock_work_orders').insert({
        dry_dock_id: req.params.id, work_order_id: woId,
        location: req.body.location || null, sort_order: (max?.m ?? 0) + 1,
    });
    ok(res, { id }, 201);
});

// edit data spec wo di dock
exports.updateWorkOrder = asyncHandler(async (req, res) => {
    const b = req.body;
    const patch = {};
    for (const key of ['status', 'location']) if (b[key] !== undefined) patch[key] = b[key];
    if (b.exported !== undefined) patch.exported = !!b.exported;
    await knex('dock_work_orders').where({ id: req.params.dockWoId, dry_dock_id: req.params.id }).update(patch);
    ok(res, { id: Number(req.params.dockWoId) });
});

// hapus data spec wo di dock
exports.removeWorkOrder = asyncHandler(async (req, res) => {
    await knex('dock_work_orders').where({ id: req.params.dockWoId, dry_dock_id: req.params.id }).del();
    ok(res, { deleted: true });
});