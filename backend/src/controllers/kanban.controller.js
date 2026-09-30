const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

const BOARDS = {
    quotes_pending_approval: { columnField: 'vessel_id' },
    pending_yard_quotes: { columnField: 'vessel_id' },
    jobs_awaiting_dock: { columnField: 'dry_dock_id' },
};

function boardConfig(board) {
    const config = BOARDS[board];
    if (!config) throw new ApiError(404, `Papan kanban "${board}" tidak dikenal`);
    return config;
}

// ambil data kanban yg di dashboar
exports.show = asyncHandler(async (req, res) => {
    const board = req.params.board;
    const config = boardConfig(board);

    const columns =
        config.columnField === 'vessel_id'
        ? await knex('vessels').select('id', 'name as label').orderBy('id')
        : await knex('dry_docks as dd')
            .leftJoin('vessels as v', 'dd.vessel_id', 'v.id')
            .select('dd.id', 'dd.dock_no as label', 'v.name as vessel_name')
            .orderBy('dd.id');

    const cards = await knex('kanban_cards')
        .where('board', board)
        .orderBy('sort_order')
        .orderBy('id');

    const withCards = columns.map((col) => ({
        ...col,
        cards: cards.filter((c) => c[config.columnField] === col.id),
    }));

    ok(res, { board, column_field: config.columnField, columns: withCards });
});

// tambah data kanban
exports.store = asyncHandler(async (req, res) => {
    const { board, column_id, title, description } = req.body;
    const config = boardConfig(board);
    if (!column_id || !title) throw new ApiError(400, 'column_id dan title wajib diisi');

    const max = await knex('kanban_cards').where({ board, [config.columnField]: column_id }).max('sort_order as m').first();
    const [id] = await knex('kanban_cards')
        .insert({
        board,
        [config.columnField]: column_id,
        title,
        description: description || null,
        sort_order: (max?.m ?? -1) + 1,
        })
        .returning('id');
    ok(res, { id: id?.id ?? id }, 201);
});

// ubah data kanban
exports.update = asyncHandler(async (req, res) => {
    const card = await knex('kanban_cards').where('id', req.params.id).first();
    if (!card) throw new ApiError(404, 'Kartu kanban tidak ditemukan');
    const config = boardConfig(card.board);

    const patch = {};
    if (req.body.title !== undefined) patch.title = req.body.title;
    if (req.body.description !== undefined) patch.description = req.body.description;

    if (req.body.column_id !== undefined) {
        patch[config.columnField] = req.body.column_id;
        const max = await knex('kanban_cards')
        .where({ board: card.board, [config.columnField]: req.body.column_id })
        .max('sort_order as m').first();
        patch.sort_order = (max?.m ?? -1) + 1;
    }
    if (req.body.sort_order !== undefined) patch.sort_order = req.body.sort_order;

    await knex('kanban_cards').where('id', req.params.id).update(patch);
    ok(res, { id: Number(req.params.id) });
});

// hapus data kanban
exports.destroy = asyncHandler(async (req, res) => {
    await knex('kanban_cards').where('id', req.params.id).del();
    ok(res, { deleted: true });
});
