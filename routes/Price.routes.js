const express = require('express');
const {
  addTodayPrice,
  updateTodayPrice,
  getAllPrice,
  upsertTodayPrice,
  bulkUpdatePrices
} = require('../controller/Price.Controller');

const router = express.Router();

// **Routes**
router.get('/', getAllPrice);
router.get('/PriceRouting', getAllPrice);
router.post('/todayPrice', addTodayPrice);
router.post('/set-rate', upsertTodayPrice);
router.post('/set-bulk', bulkUpdatePrices);
router.put('/price/:id', updateTodayPrice);
router.patch('/price/:id', updateTodayPrice);

module.exports = router;

