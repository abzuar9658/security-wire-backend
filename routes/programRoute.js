const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const programController = require('./../controllers/programController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('customer'),
  programController.createProgram
);
router.get('/getpublic', programController.getPublicPrograms);
router.get('/', authController.protect, programController.getmyPrograms);
router.get(
  '/getAll',
  authController.protect,
  authController.restrictTo('admin'),
  programController.getAllPrograms
);
router.get(
  '/toApprove',
  authController.protect,
  authController.restrictTo('admin'),
  programController.getProgramsToApprove
);
router.get(
  '/:programId/approve',
  authController.protect,
  authController.restrictTo('admin'),
  programController.approveProgram
);
router.patch(
  '/:programId/invites',
  authController.protect,
  programController.sendInvitations
);
router.get(
  '/:programId/enroll',
  authController.protect,
  authController.restrictTo('security-researcher'),
  programController.getEnrolled
);
router.get(
  '/:programId/unenroll',
  authController.protect,
  authController.restrictTo('security-researcher'),
  programController.getUnenrolled
);
router.delete('/:id', authController.protect, programController.deleteMe);
router.patch('/:id', authController.protect, programController.updateMe);

module.exports = router;
