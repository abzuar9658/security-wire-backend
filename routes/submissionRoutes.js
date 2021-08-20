const express = require('express');
const authController = require('./../controllers/authController');
const submissionController = require('./../controllers/submissionController');
const router = express.Router();

router.get(
  '/getAll',
  authController.protect,
  authController.restrictTo('admin'),
  submissionController.getAllSubmissions
);
router.get(
  '/:programId',
  authController.protect,
  submissionController.getSubmissionsByProgram
);
router.post(
  '/:programId',
  authController.protect,
  authController.restrictTo('security-researcher'),
  submissionController.uploadPOC,
  submissionController.postNewSubmission
);
router.patch(
  '/:submissionId',
  authController.protect,
  authController.restrictTo('security-researcher'),
  submissionController.uploadPOC,
  submissionController.updateSubmission
);
router.delete(
  '/:submissionId',
  authController.protect,
  authController.restrictTo('security-researcher'),
  submissionController.deleteSubmission
);
router.patch(
  '/:submissionId/approve',
  authController.protect,
  authController.restrictTo('admin'),
  submissionController.approveSubmission
);

router.get(
  '/payment/:submissionId',
  authController.protect,
  authController.restrictTo('customer'),
  submissionController.getCheckoutSession
);

module.exports = router;
