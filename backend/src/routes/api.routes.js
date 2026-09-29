const router = require('express').Router();
const master = require('../controllers/master.controller');
const specGroups = require('../controllers/specification-groups.controller');

router.get('/vessels', master.vessels);
router.get('/shipyards', master.shipyards);

router.get('/specification-groups', specGroups.index);
router.get('/specification-groups/:id', specGroups.show);
router.post('/specification-groups', specGroups.store);
router.put('/specification-groups/:id', specGroups.update);
router.delete('/specification-groups/:id', specGroups.destroy);

module.exports = router;