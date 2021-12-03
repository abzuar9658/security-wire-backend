const express = require('express');
const authController = require('./../controllers/authController');
const scannerController = require('./../controllers/scannerController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
<<<<<<< HEAD
  authController.restrictTo('customer'),
  scannerController.createScan
);
router.get('/', authController.protect, scannerController.getmyScans);
=======
  scannerController.createScan
);
router.get('/', authController.protect, scannerController.getmyScans);
router.get('/status', authController.protect, scannerController.status);
>>>>>>> cb8a41adbcbeaaa9b11ab9aac3acccdf6355aa2c
router.get(
  '/getAll',
  authController.protect,
  authController.restrictTo('admin'),
  scannerController.getAllScans
);
router.delete('/:id', authController.protect, scannerController.deleteMe);

module.exports = router;
