const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/urlController'); // ✅ make sure this file exists

router.post('/shorten',    ctrl.shorten);
router.get ('/all',        ctrl.list);
router.get ('/stats',      ctrl.stats);
router.post('/set-length', ctrl.setLen);
router.get('/platform-clicks/:base', ctrl.platformClicks);

router.get ('/:short',     ctrl.redirect);  // always keep last!

module.exports = router;
