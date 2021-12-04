const express = require('express');
const authController = require('./../controllers/authController');
const scannerController = require('./../controllers/scannerController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('customer'),
  scannerController.createScan
);
router.get('/', authController.protect, scannerController.getmyScans);
router.get(
  '/getAll',
  authController.protect,
  authController.restrictTo('admin'),
  scannerController.getAllScans
);
router.delete('/:id', authController.protect, scannerController.deleteMe);

module.exports = router;
