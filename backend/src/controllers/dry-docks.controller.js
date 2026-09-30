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
    ok(res, { ...dock, ...(await costsSummary(dock)) });
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

// ambil data tasks di dock
exports.tasks = asyncHandler(async (req, res) => {
    ok(res, await knex('tasks').where('dry_dock_id', req.params.id).orderBy('id'));
});

// tambah data task di dock
exports.addTask = asyncHandler(async (req, res) => {
    const [id] = await knex('tasks').insert({
        dry_dock_id: req.params.id, title: req.body.title,
        description: req.body.description || null, responsibility: req.body.responsibility || null,
        due_date: req.body.due_date || null, status: req.body.status || 'Open',
    });
    ok(res, { id }, 201);
});

// ubah data task di dock
exports.updateTask = asyncHandler(async (req, res) => {
    const patch = {};
    for (const key of ['title', 'description', 'responsibility', 'due_date', 'status']) {
        if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await knex('tasks').where({ id: req.params.taskId, dry_dock_id: req.params.id }).update(patch);
    ok(res, { id: Number(req.params.taskId) });
});

// hapus data task di dock
exports.deleteTask = asyncHandler(async (req, res) => {
    await knex('tasks').where({ id: req.params.taskId, dry_dock_id: req.params.id }).del();
    ok(res, { deleted: true });
});

// ambil data purchase order di dock
exports.purchaseOrders = asyncHandler(async (req, res) => {
    ok(res, await knex('purchase_orders').where('dry_dock_id', req.params.id).orderBy('id'));
});

// tambah data purchase order di dock
exports.addPurchaseOrder = asyncHandler(async (req, res) => {
    const [id] = await knex('purchase_orders').insert({
        dry_dock_id: req.params.id, po_no: req.body.po_no, supplier: req.body.supplier || null,
        total: req.body.total ?? 0, category: req.body.category || 'Inventory',
    });
    ok(res, { id }, 201);
});


// ambil data updates di dock
exports.updates = asyncHandler(async (req, res) => {
    const rows = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .leftJoin('specification_groups as sg', 'wo.spec_group_id', 'sg.id')
        .where('dwo.dry_dock_id', req.params.id)
        .select('dwo.id as dock_wo_id', 'dwo.status', 'wo.job_code', 'wo.job_name', 'sg.name as spec_group_name');

    const latest = await knex('wo_updates as u')
        .join(knex('wo_updates').max('id as max_id').groupBy('dock_work_order_id').as('lat'), 'lat.max_id', 'u.id')
        .select('u.*');
    const latestMap = Object.fromEntries(latest.map((u) => [u.dock_work_order_id, u]));

    ok(res, rows.map((r) => ({ ...r, latest_update: latestMap[r.dock_wo_id] || null })));
});

// tambah data update di dock
exports.addUpdate = asyncHandler(async (req, res) => {
    const [id] = await knex('wo_updates').insert({
        dock_work_order_id: req.body.dock_work_order_id,
        progress: req.body.progress ?? 0,
        note: req.body.note || null,
        updated_by: req.body.updated_by || 'Unknown',
    });
    if (req.body.progress >= 100 && req.body.mark_complete) {
        await knex('dock_work_orders').where('id', req.body.dock_work_order_id).update({ status: 'Complete' });
    }
    ok(res, { id }, 201);
});

// ambil data facts di dock
exports.facts = asyncHandler(async (req, res) => {
    ok(res, await knex('dock_facts').where('dry_dock_id', req.params.id).orderBy('id'));
});

// tambah atau ubah data facts di dock
exports.updateFacts = asyncHandler(async (req, res) => {
    const entries = Object.entries(req.body.facts || {});
    for (const [factKey, occurredAt] of entries) {
        const existing = await knex('dock_facts').where({ dry_dock_id: req.params.id, fact_key: factKey }).first();
        if (existing) {
        await knex('dock_facts').where('id', existing.id).update({ occurred_at: occurredAt || null });
        } else {
        await knex('dock_facts').insert({ dry_dock_id: req.params.id, fact_key: factKey, occurred_at: occurredAt || null });
        }
    }
    ok(res, { saved: true });
});

// ambil data meetings di dock
exports.meetings = asyncHandler(async (req, res) => {
    ok(res, await knex('meetings').where('dry_dock_id', req.params.id).orderBy('meeting_date'));
});

// tambah data meeting di dock
exports.addMeeting = asyncHandler(async (req, res) => {
    const [id] = await knex('meetings').insert({
        dry_dock_id: req.params.id, title: req.body.title,
        meeting_date: req.body.meeting_date || null, attendees: req.body.attendees || null,
        notes: req.body.notes || null,
    });
    ok(res, { id }, 201);
});

// ambil data variation orders di dock
exports.variationOrders = asyncHandler(async (req, res) => {
    ok(res, await knex('variation_orders as vo')
        .leftJoin('work_orders as wo', 'vo.work_order_id', 'wo.id')
        .where('vo.dry_dock_id', req.params.id)
        .select('vo.*', 'wo.job_name'));
});

// tambah data variation order di dock
exports.addVariationOrder = asyncHandler(async (req, res) => {
    const [id] = await knex('variation_orders').insert({
        dry_dock_id: req.params.id, work_order_id: req.body.work_order_id || null,
        title: req.body.title, cost: req.body.cost ?? 0, status: req.body.status || 'Open',
    });
    ok(res, { id }, 201);
});

// ambil data daily reports di dock
exports.reports = asyncHandler(async (req, res) => {
    ok(res, await knex('daily_reports').where('dry_dock_id', req.params.id).orderBy('report_date', 'desc'));
});

// tambah data daily report di dock
exports.addReport = asyncHandler(async (req, res) => {
    const [id] = await knex('daily_reports').insert({
        dry_dock_id: req.params.id, title: req.body.title, author: req.body.author || null,
        report_date: req.body.report_date || knex.fn.now(), content: req.body.content || null,
    });
    ok(res, { id }, 201);
});

// ambil ringkasan biaya di dock
async function costsSummary(dock) {
    const statusCounts = await knex('dock_work_orders')
        .where('dry_dock_id', dock.id)
        .select('status').count({ total: 'id' }).groupBy('status');

    const woAgg = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .where('dwo.dry_dock_id', dock.id)
        .first({
        owner_estimates: knex.raw('COALESCE(SUM(wo.internal_estimate), 0)'),
        actual_costs: knex.raw('COALESCE(SUM(wo.budget), 0)'),
        });

    let yardEstimates = 0;
    if (await knex.schema.hasTable('quotations') && await knex.schema.hasTable('rfqs')) {
        const yardQuote = await knex('quotations as q')
        .join('rfqs as r', 'q.rfq_id', 'r.id')
        .where({ 'r.dry_dock_id': dock.id, 'q.selected': true })
        .sum({ total: 'q.total' })
        .first();
        yardEstimates = yardQuote?.total ? Number(yardQuote.total) : 0;
    }

    const ownerEstimates = Number(woAgg?.owner_estimates ?? 0);
    const actualYard = yardEstimates;
    const actualOwner = Number(woAgg?.actual_costs ?? 0);

    return {
        status_counts: statusCounts,
        cost_summary: {
        budget: Number(dock.budget) || 0,
        yard_estimates: yardEstimates,
        owner_estimates: ownerEstimates,
        total_estimates: yardEstimates + ownerEstimates,
        actual_yard_costs: actualYard,
        actual_owner_costs: actualOwner,
        total_costs: actualYard + actualOwner,
        variance: (yardEstimates + ownerEstimates) - (actualYard + actualOwner),
        },
    };
}

// ambil ringkasan biaya di dock
exports.costs = asyncHandler(async (req, res) => {
    const dock = await knex('dry_docks').where('id', req.params.id).first();
    if (!dock) throw new ApiError(404, 'Dry dock tidak ditemukan');
    const { cost_summary } = await costsSummary(dock);

    const details = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .where('dwo.dry_dock_id', req.params.id)
        .select(
        'dwo.id as dock_wo_id', 'wo.job_code', 'wo.job_name',
        'wo.internal_estimate', 'wo.budget',
        );

    ok(res, { summary: cost_summary, details });
});

// ambil ringkasan biaya di dock
exports.copyYardEstimates = asyncHandler(async (req, res) => {
    const dock = await knex('dry_docks').where('id', req.params.id).first();
    if (!dock) throw new ApiError(404, 'Dry dock tidak ditemukan');
    const quote = await knex('quotations as q')
        .join('rfqs as r', 'q.rfq_id', 'r.id')
        .where({ 'r.dry_dock_id': dock.id, 'q.selected': true })
        .first();
    ok(res, { copied: !!quote });
});