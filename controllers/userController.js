const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.suspendUser = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  await User.findByIdAndUpdate(id, { isSuspended: true });
  res.status(200).json({
    success: true,
    data: {
      message: 'user suspended!'
    }
  });
});
exports.unSuspendUser = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  await User.findByIdAndUpdate(id, { isSuspended: false });
  res.status(200).json({
    success: true,
    data: {
      message: 'user unsuspended!'
    }
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const role = req.params.role;
  const users = await User.find({ role })
    .populate('programsSubmitted')
    .populate('programInvitations')
    .populate('programsEnrolled')
    .populate('createdPrograms');
  return res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getSecurityResearchers = catchAsync(async (req, res, next) => {
  const users = await User.find()
    .where('role')
    .equals('security-researcher');
  return res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});


exports.status = catchAsync(async (req, res, next) => {
  const users = await User.findOne({ _id: req.user._id })
  var xstatus = false
  if(users.scanning == true){
    xstatus = true
  }
  return res.status(200).json({
    status: xstatus,
  });
});


exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
