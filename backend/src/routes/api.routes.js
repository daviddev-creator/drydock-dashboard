const router = require('express').Router();
const master = require('../controllers/master.controller');

router.get('/vessels', master.vessels);
router.get('/shipyards', master.shipyards);

module.exports = router;