// backend/routes/sales.js
const express = require('express');
const {
  getSales,
  getSaleById,
  createSale,
  getMonthlySales
} = require('../controllers/saleController');

const router = express.Router();

router.get('/monthly', getMonthlySales); 
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSaleById);

module.exports = router;