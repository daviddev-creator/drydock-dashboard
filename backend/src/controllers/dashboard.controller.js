const { asyncHandler, ok, ApiError } = require('../utils');
const knex = require('../db');

exports.index = asyncHandler(async (req, res) => {
    const quoteWithVessel = () =>
        knex('quotations as q')
        .join('shipyards as sy', 'q.shipyard_id', 'sy.id')
        .join('rfqs as r', 'q.rfq_id', 'r.id')
        .join('dry_docks as dd', 'r.dry_dock_id', 'dd.id')
        .join('vessels as v', 'dd.vessel_id', 'v.id')
        .select(
            'q.id', 'q.quotation_no', 'q.total', 'q.status', 'q.rfq_id', 'q.shipyard_id',
            'sy.name as shipyard', 'v.name as vessel', 'v.id as vessel_id',
            'dd.id as dock_id', 'dd.dock_no', 'dd.description as dock_description',
        )
        .orderBy('v.name');

    const [quotesApproval, pendingQuotes] = await Promise.all([
        quoteWithVessel().where('q.status', 'Received'),
        quoteWithVessel().where('q.status', 'Sent, Awaiting Quotation'),
    ]);

    const groupByVessel = (rows) => {
        const map = new Map();
        for (const row of rows) {
        if (!map.has(row.vessel)) map.set(row.vessel, []);
        map.get(row.vessel).push(row);
        }
        return [...map.entries()].map(([vessel, quotes]) => ({ vessel, quotes }));
    };

    const jobsAwaiting = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .join('dry_docks as dd', 'dwo.dry_dock_id', 'dd.id')
        .join('vessels as v', 'dd.vessel_id', 'v.id')
        .where('dwo.status', 'Open')
        .select('dwo.id', 'dwo.status', 'dwo.location', 'wo.job_name', 'wo.job_code', 'wo.job_type', 'dd.id as dock_id', 'dd.dock_no', 'v.name as vessel_name')
        .orderBy('dd.dock_no');

    const jobsByDock = jobsAwaiting.reduce((acc, job) => {
        (acc[job.dock_no] ??= { dock: job.dock_no, dock_id: job.dock_id, vessel_name: job.vessel_name, jobs: [] });
        acc[job.dock_no].jobs.push(job);
        return acc;
    }, {});

    const statusCounts = await knex('dock_work_orders')
        .select('status')
        .count({ total: 'id' })
        .groupBy('status');

    const costs = await knex('dry_docks as dd')
        .leftJoin('rfqs as r', 'r.dry_dock_id', 'dd.id')
        .leftJoin('quotations as q', (join) => {
        join.on('q.rfq_id', 'r.id').andOn('q.selected', knex.raw('1'));
        })
        .groupBy('dd.id')
        .select('dd.id', 'dd.dock_no', 'dd.budget')
        .sum({ yard_estimates: 'q.total' });

    const costDetails = await knex('dock_work_orders as dwo')
        .join('work_orders as wo', 'dwo.work_order_id', 'wo.id')
        .groupBy('dwo.dry_dock_id')
        .select('dwo.dry_dock_id')
        .sum({ owner_estimates: 'wo.internal_estimate', actual_costs: 'wo.budget' });
    const costMap = Object.fromEntries(costDetails.map((c) => [c.dry_dock_id, c]));

    ok(res, {
        quotes_pending_approval: groupByVessel(quotesApproval),
        pending_yard_quotes: groupByVessel(pendingQuotes),
        jobs_awaiting_dock: Object.values(jobsByDock),
        active_dry_docks: statusCounts.map((s) => ({ status: s.status, total: s.total })),
        costs: costs.map((c) => ({
        dock_no: c.dock_no,
        budget: c.budget || 0,
        estimates: c.yard_estimates || 0,
        costs: (costMap[c.id]?.owner_estimates || 0) + (c.yard_estimates || 0),
        })),
    });
});
