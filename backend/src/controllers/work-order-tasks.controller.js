const { asyncHandler, ok } = require('../utils');
const knex = require('../db');

// list data
exports.index = asyncHandler(async (req, res) => {
    ok(res, await knex('tasks').where('work_order_id', req.params.id).orderBy('id'));
})

// tambah data
exports.store = asyncHandler(async (req, res) => {
    const [id] = await knex('tasks').insert({
        work_order_id: req.params.id, 
        title: req.body.title,
        description: req.body.description || null, 
        responsibility: req.body.responsibility || null,
        due_date: req.body.due_date || null, 
        status: req.body.status || 'Open',
    });
    ok(res, { id }, 201);
})

//update data
exports.update = asyncHandler(async (req, res) => {
    const patch = {};
    for (const key of ['title', 'description', 'responsibility', 'due_date', 'status']) {
        if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await knex('tasks').where({ id: req.params.taskId, work_order_id: req.params.id }).update(patch);
    ok(res, { id: Number(req.params.taskId) });
});

//hapus data
exports.destroy = asyncHandler(async (req, res) => {
    await knex('tasks').where({ id: req.params.taskId, work_order_id: req.params.id }).del();
    ok(res, { deleted: true });
});