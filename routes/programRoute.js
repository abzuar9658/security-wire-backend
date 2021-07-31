const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const programController = require('./../controllers/programController');

const router = express.Router();

router.post('/create',authController.protect,authController.restrictTo('customer'), programController.createProgram);
router.get('/getpublic', programController.getPublicPrograms);
router.get('/',authController.protect, programController.getmyPrograms);
router.get('/getAll',authController.protect,authController.restrictTo('admin'), programController.getAllPrograms);

router.delete('/:id',authController.protect, programController.deleteMe)
router.patch('/:id',authController.protect, programController.updateMe);


router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, programController.deleteMe);

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
