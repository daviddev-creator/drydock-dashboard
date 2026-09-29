const router = require('express').Router();
const master = require('../controllers/master.controller');
const specGroups = require('../controllers/specification-groups.controller');
const workOrders = require('../controllers/work-orders.controller');
const woTasks = require('../controllers/work-order-tasks.controller');


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

module.exports = router;