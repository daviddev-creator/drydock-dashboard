const router = require('express').Router();
const master = require('../controllers/master.controller');
const specGroups = require('../controllers/specification-groups.controller');
const workOrders = require('../controllers/work-orders.controller');
const woTasks = require('../controllers/work-order-tasks.controller');
const checklists = require('../controllers/checklists.controller');
const dryDocks = require('../controllers/dry-docks.controller');
const sourcing = require('../controllers/sourcing.controller');


router.get('/vessels', master.vessels);
router.get('/shipyards', master.shipyards);

router.get('/specification-groups', specGroups.index);
router.get('/specification-groups/:id', specGroups.show);
router.post('/specification-groups', specGroups.store);
router.put('/specification-groups/:id', specGroups.update);
router.delete('/specification-groups/:id', specGroups.destroy);

router.get('/work-orders', workOrders.index);
router.get('/work-orders/:id', workOrders.show);
router.post('/work-orders', workOrders.store);
router.put('/work-orders/:id', workOrders.update);
router.delete('/work-orders/:id', workOrders.destroy);

router.post('/work-orders/:id/sub-jobs', workOrders.addSubJob);
router.put('/work-orders/:id/sub-jobs/:subId', workOrders.updateSubJob);
router.delete('/work-orders/:id/sub-jobs/:subId', workOrders.deleteSubJob);

router.post('/work-orders/:id/spares', workOrders.addSpare);
router.delete('/work-orders/:id/spares/:rowId', workOrders.deleteSpare);

router.post('/work-orders/:id/attachments', workOrders.addAttachment);
router.put('/work-orders/:id/attachments/:rowId', workOrders.updateAttachment);
router.delete('/work-orders/:id/attachments/:rowId', workOrders.deleteAttachment);

router.get('/work-orders/:id/tasks', woTasks.index);
router.post('/work-orders/:id/tasks', woTasks.store);
router.put('/work-orders/:id/tasks/:taskId', woTasks.update);
router.delete('/work-orders/:id/tasks/:taskId', woTasks.destroy);

router.post('/work-orders/:id/purchase-orders', workOrders.addPurchaseOrder);

router.post('/work-orders/:id/checklists', workOrders.attachChecklist);
router.put('/work-orders/:id/checklists/:rowId', workOrders.saveChecklist);
router.delete('/work-orders/:id/checklists/:rowId', workOrders.detachChecklist);

router.get('/checklists', checklists.index);
router.get('/checklists/:id', checklists.show);
router.post('/checklists', checklists.store);
router.put('/checklists/:id', checklists.update);
router.delete('/checklists/:id', checklists.destroy);

router.post('/checklists/:id/items', checklists.addItem);
router.put('/checklists/:id/items/:itemId', checklists.updateItem);
router.delete('/checklists/:id/items/:itemId', checklists.deleteItem);

router.get('/dry-docks', dryDocks.index);
router.get('/dry-docks/:id', dryDocks.show);
router.post('/dry-docks', dryDocks.store);
router.put('/dry-docks/:id', dryDocks.update);
router.delete('/dry-docks/:id', dryDocks.destroy);

router.post('/work-orders/:id/add-to-spec', workOrders.addToSpec);
router.get('/dry-docks/:id/work-orders', dryDocks.workOrders);
router.post('/dry-docks/:id/work-orders', dryDocks.addWorkOrder);
router.put('/dry-docks/:id/work-orders/:dockWoId', dryDocks.updateWorkOrder);
router.delete('/dry-docks/:id/work-orders/:dockWoId', dryDocks.removeWorkOrder);

router.get('/dry-docks/:id/tasks', dryDocks.tasks);
router.post('/dry-docks/:id/tasks', dryDocks.addTask);
router.put('/dry-docks/:id/tasks/:taskId', dryDocks.updateTask);
router.delete('/dry-docks/:id/tasks/:taskId', dryDocks.deleteTask);

router.get('/dry-docks/:id/updates', dryDocks.updates);
router.post('/dry-docks/:id/updates', dryDocks.addUpdate);
router.get('/dry-docks/:id/facts', dryDocks.facts);
router.put('/dry-docks/:id/facts', dryDocks.updateFacts);
router.get('/dry-docks/:id/meetings', dryDocks.meetings);
router.post('/dry-docks/:id/meetings', dryDocks.addMeeting);
router.get('/dry-docks/:id/variation-orders', dryDocks.variationOrders);
router.post('/dry-docks/:id/variation-orders', dryDocks.addVariationOrder);

router.get('/dry-docks/:id/reports', dryDocks.reports);
router.post('/dry-docks/:id/reports', dryDocks.addReport);

router.get('/dry-docks/:id/costs', dryDocks.costs);
router.post('/dry-docks/:id/costs/copy-yard-estimates', dryDocks.copyYardEstimates);

router.get('/dry-docks/:id/purchase-orders', dryDocks.purchaseOrders);
router.post('/dry-docks/:id/purchase-orders', dryDocks.addPurchaseOrder);

router.get('/dry-docks/:id/rfqs', sourcing.rfqs);
router.post('/dry-docks/:id/rfqs', sourcing.addRfq);
router.post('/dry-docks/:id/rfqs/:rfqId/quotations', sourcing.addQuotation);
router.put('/dry-docks/:id/rfqs/:rfqId/quotations/:quoteId', sourcing.updateQuotation);
router.put('/quotations/:quoteId/decision', sourcing.decideQuotation);
router.post('/quotations', sourcing.createQuotationQuick);
router.put('/quotations/:quoteId', sourcing.updateQuotationById);
router.get('/dry-docks/:id/quote-compare', sourcing.quoteCompare);
router.get('/dry-docks/:id/approvals', sourcing.approvals);
router.post('/dry-docks/:id/approvals', sourcing.addApproval);
router.put('/dry-docks/:id/approvals/:approvalId', sourcing.decideApproval);

module.exports = router;