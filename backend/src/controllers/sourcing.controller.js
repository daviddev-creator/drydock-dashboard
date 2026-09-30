const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

// ambil data rfq
exports.rfqs = asyncHandler(async (req, res) => {
    const rfqs = await knex('rfqs').where('dry_dock_id', req.params.id).orderBy('id');
    const result = [];
    for (const rfq of rfqs) {
        const quotations = await knex('quotations as q')
        .join('shipyards as sy', 'q.shipyard_id', 'sy.id')
        .where('q.rfq_id', rfq.id)
        .select('q.*', 'sy.name as shipyard_name')
        .orderBy('q.id');
        result.push({ ...rfq, quotations });
    }
    ok(res, result);
});

// tambah rfq baru
exports.addRfq = asyncHandler(async (req, res) => {
    const [id] = await knex('rfqs').insert({
        dry_dock_id: req.params.id, rfq_no: req.body.rfq_no,
        rfq_date: req.body.rfq_date || null, expiry_date: req.body.expiry_date || null,
        comments: req.body.comments || null,
    });
    ok(res, { id }, 201);
});

// tambah quotation
exports.addQuotation = asyncHandler(async (req, res) => {
    const [id] = await knex('quotations').insert({
        rfq_id: req.params.rfqId, shipyard_id: req.body.shipyard_id,
        quotation_no: req.body.quotation_no || null, status: req.body.status || 'Not Sent',
        total: req.body.total ?? 0,
    });
    ok(res, { id }, 201);
});

// ubah quotation
exports.updateQuotation = asyncHandler(async (req, res) => {
    const patch = {};
    for (const key of ['quotation_no', 'status']) {
        if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (req.body.total !== undefined) patch.total = req.body.total;
    if (req.body.send) {
        patch.status = 'Sent, Awaiting Quotation';
        patch.sent_at = knex.fn.now();
    }
    if (req.body.select !== undefined) patch.selected = !!req.body.select;
    const count = await knex('quotations').where({ id: req.params.quoteId, rfq_id: req.params.rfqId }).update(patch);
    if (!count) throw new ApiError(404, 'Quotation tidak ditemukan');
    ok(res, { id: Number(req.params.quoteId) });
});

// ubah status quotation
exports.decideQuotation = asyncHandler(async (req, res) => {
    const decision = req.body.decision;
    if (!['Approved', 'Rejected'].includes(decision)) throw new ApiError(400, 'decision harus Approved atau Rejected');
    const count = await knex('quotations').where('id', req.params.quoteId).update({ status: decision });
    if (!count) throw new ApiError(404, 'Quotation tidak ditemukan');
    ok(res, { id: Number(req.params.quoteId) });
});

// tambah quotation cepat
exports.createQuotationQuick = asyncHandler(async (req, res) => {
    const { dry_dock_id, shipyard_id, quotation_no, total, status } = req.body;
    if (!dry_dock_id || !shipyard_id) throw new ApiError(400, 'dry_dock_id dan shipyard_id wajib diisi');

    let rfq = await knex('rfqs').where('dry_dock_id', dry_dock_id).first();
    if (!rfq) {
        const dock = await knex('dry_docks').where('id', dry_dock_id).first();
        if (!dock) throw new ApiError(404, 'Dry dock tidak ditemukan');
        const counter = await knex('rfqs').count({ c: 'id' }).first();
        const [row] = await knex('rfqs').insert({
        dry_dock_id,
        rfq_no: `AUTO/${dock.dock_no}/${String((counter?.c ?? 0) + 1).padStart(4, '0')}`,
        }).returning('id');
        rfq = { id: row.id ?? row }; // driver database bisa mengembalikan id langsung atau objek { id }
    }

    const [id] = await knex('quotations').insert({
        rfq_id: rfq.id,
        shipyard_id,
        quotation_no: quotation_no || null,
        status: status || 'Not Sent',
        total: total ?? 0,
    }).returning('id');
    ok(res, { id: id?.id ?? id }, 201);
});

// ubah quotation berdasarkan id
exports.updateQuotationById = asyncHandler(async (req, res) => {
    const patch = {};
    for (const key of ['quotation_no', 'status', 'shipyard_id']) {
        if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (req.body.total !== undefined) patch.total = req.body.total;
    const count = await knex('quotations').where('id', req.params.quoteId).update(patch);
    if (!count) throw new ApiError(404, 'Quotation tidak ditemukan');
    ok(res, { id: Number(req.params.quoteId) });
});

// komparasi quotation berdasarkan dry dock id
exports.quoteCompare = asyncHandler(async (req, res) => {
    const quotes = await knex('quotations as q')
        .join('rfqs as r', 'q.rfq_id', 'r.id')
        .join('shipyards as sy', 'q.shipyard_id', 'sy.id')
        .where('r.dry_dock_id', req.params.id)
        .select('q.*', 'sy.name as shipyard_name')
        .orderBy('q.total');
    ok(res, quotes);
});

// ambil data approval berdasarkan dry dock id
exports.approvals = asyncHandler(async (req, res) => {
    ok(res, await knex('approvals').where('dry_dock_id', req.params.id).orderBy('level'));
});

// tambah approval baru
exports.addApproval = asyncHandler(async (req, res) => {
    const [id] = await knex('approvals').insert({
        dry_dock_id: req.params.id, level: req.body.level ?? 1,
        approver: req.body.approver, status: req.body.status || 'Pending',
    });
    ok(res, { id }, 201);
});

// tentukan status approval
exports.decideApproval = asyncHandler(async (req, res) => {
    const patch = { status: req.body.status };
    if (req.body.status === 'Approved') patch.decided_at = knex.fn.now();
    const count = await knex('approvals').where({ id: req.params.approvalId, dry_dock_id: req.params.id }).update(patch);
    if (!count) throw new ApiError(404, 'Approval tidak ditemukan');
    ok(res, { id: Number(req.params.approvalId) });
});