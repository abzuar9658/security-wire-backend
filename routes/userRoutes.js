const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const programController = require('./../controllers/programController');
const router = express.Router();

router.post('/signup', authController.signup);
router.get('/signup/newAdmin', authController.firstAdmin);
router.post('/login', authController.login);
router.get('/verify', authController.verify);

router.get(
  '/admin/:role',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getUsers
);

router.get(
  '/suspend/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  userController.suspendUser
);
router.get(
  '/unsuspend/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  userController.unSuspendUser
);
router.get(
  '/getInvitedPrograms',
  authController.protect,
  authController.restrictTo('security-researcher'),
  programController.getInvitedPrograms
);
router.get(
  '/getEnrolledPrograms',
  authController.protect,
  authController.restrictTo('security-researcher'),
  programController.getEnrolledPrograms
);
router.get(
  '/securityResearchers',
  authController.protect,
  userController.getSecurityResearchers
);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
