const router = require('express').Router();
const master = require('../controllers/master.controller');
const specGroups = require('../controllers/specification-groups.controller');
const workOrders = require('../controllers/work-orders.controller');


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

module.exports = router;