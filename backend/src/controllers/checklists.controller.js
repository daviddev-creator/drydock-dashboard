const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

// list data
exports.index = asyncHandler(async (req, res) => {
    let query = knex('checklists');
    if (req.query.q) query = query.where((w) => w.where('name', 'like', `%${req.query.q}%`).orWhere('description', 'like', `%${req.query.q}%`));
    ok(res, await query.orderBy('id'));
});

// show data
exports.show = asyncHandler(async (req, res) => {
    const checklist = await knex('checklists').where('id', req.params.id).first();
    if (!checklist) throw new ApiError(404, 'Checklist tidak ditemukan');
    const items = await knex('checklist_items').where('checklist_id', checklist.id).orderBy('sort_order');
    ok(res, { ...checklist, items: items.map((i) => ({ ...i, options: i.options ? JSON.parse(i.options) : [] })) });
});

// tambah data
exports.store = asyncHandler(async (req, res) => {
    const row = { name: req.body.name, description: req.body.description || null };
    if (await knex.schema.hasColumn('checklists', 'active')) {
        row.active = req.body.active ?? true;
    }
    const [id] = await knex('checklists').insert(row);
    ok(res, { id }, 201);
});


// update data
exports.update = asyncHandler(async (req, res) => {
    const b = req.body;
    const patch = {};
    if (b.name !== undefined) patch.name = b.name;
    if (b.description !== undefined) patch.description = b.description;
    if (b.active !== undefined && (await knex.schema.hasColumn('checklists', 'active'))) {
        patch.active = !!b.active;
    }
    const count = await knex('checklists').where('id', req.params.id).update(patch);
    if (!count) throw new ApiError(404, 'Checklist tidak ditemukan');
    ok(res, { id: Number(req.params.id) });
});

// hapus data
exports.destroy = asyncHandler(async (req, res) => {
    await knex('checklists').where('id', req.params.id).del();
    ok(res, { deleted: true });
});

// tambah item
exports.addItem = asyncHandler(async (req, res) => {
    const [id] = await knex('checklist_items').insert({
        checklist_id: req.params.id,
        title: req.body.title,
        data_type: req.body.data_type || 'text',
        options: Array.isArray(req.body.options) ? JSON.stringify(req.body.options) : null,
        sort_order: req.body.sort_order ?? 99,
    });
    ok(res, { id }, 201);
});

// update item
exports.updateItem = asyncHandler(async (req, res) => {
    const b = req.body;
    const patch = {};
    if (b.title !== undefined) patch.title = b.title;
    if (b.data_type !== undefined) patch.data_type = b.data_type;
    if (b.options !== undefined) patch.options = Array.isArray(b.options) ? JSON.stringify(b.options) : null;
    if (b.sort_order !== undefined) patch.sort_order = b.sort_order;
    await knex('checklist_items').where({ id: req.params.itemId, checklist_id: req.params.id }).update(patch);
    ok(res, { id: Number(req.params.itemId) });
});

// hapus item
exports.deleteItem = asyncHandler(async (req, res) => {
    await knex('checklist_items').where({ id: req.params.itemId, checklist_id: req.params.id }).del();
    ok(res, { deleted: true });
});