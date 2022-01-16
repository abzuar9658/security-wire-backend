const Program = require('./../models/programModel');
const User = require('./../models/userModel');
const Submission = require('./../models/submissionModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { forEach } = require('p-iteration');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createProgram = catchAsync(async (req, res, next) => {
  const programBody = {
    title: req.body.title,
    customer: req.user._id.toString(),
    intro: req.body.intro,
    photo: req.body.photo,
    inScope: req.body.inScope,
    outScope: req.body.outScope,
    invited: req.body.invited,
    detail: req.body.detail,
    active: req.body.active,
    ispublic: req.body.ispublic,
    vrt: req.body.vrt
  };
  // if (req.body.vrt) {
  //   programBody.vrt = {
  //     vrt1: req.body.vrt[0],
  //     vrt2: req.body.vrt[1],
  //     vrt3: req.body.vrt[2],
  //     vrt4: req.body.vrt[3]
  //   };
  // }
  const program = await Program.create(programBody);
  const user = await User.findById(req.user._id);
  user.createdPrograms = [...user.createdPrograms, program._id];
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    data: {
      program
    }
  });
});

exports.getPublicPrograms = catchAsync(async (req, res, next) => {
  const programs = await Program.find({
    ispublic: true,
    isApproved: true,
    active: true
  }).populate('customer', 'name');
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
      program: programs
    }
  });
});

exports.getmyPrograms = catchAsync(async (req, res, next) => {
  const programs = await Program.find({ customer: req.user._id.toString() });
  // const submissions = await Submission.find({programId: })
  let myPrograms = [];
  await forEach(programs, async program => {
    let submissions = await Submission.find({
      programId: program._id,
      isApproved: true
    }).populate('researcherId', 'name');
    myPrograms = [...myPrograms, { ...program._doc, submissions }];
  });
  // SEND RESPONSE
  console.log(myPrograms);
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
      program: myPrograms
    }
  });
});

exports.getAllPrograms = catchAsync(async (req, res, next) => {
  const programs = await Program.find({
    ispublic: true,
    isApproved: true
  }).sort('date');
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
      programs: programs
    }
  });
});

exports.getProgramsToApprove = catchAsync(async (req, res, next) => {
  const programs = await Program.find({
    isApproved: false
  })
    .sort('date')
    .populate('customer', 'name');
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
      programs
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  console.log('PROGRAM UPDATE REQUEST:', req.body);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  const program = await Program.findById(req.params.id);
  if (!program) {
    res.status(404).json({
      status: 'Program Not Found',
      data: null
    });
  }
  if (req.user._id.toString() == program.customer || req.user.role == 'admin') {
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      'title',
      'customer',
      'intro',
      'photo',
      'inScope',
      'outScope',
      'vrt',
      'active',
      'ispublic',
      'invited',
      'detail'
    );

    // 3) Update user document
    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        program: updatedProgram
      }
    });
  } else {
    res.status(403).json({
      status: 'You dont have persmission to update this program',
      data: null
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  let program = await Program.findById(req.params.id);
  if (!program) {
    res.status(404).json({
      status: 'Program Not Found',
      data: null
    });
  }
  const user = await User.findById(req.user._id);
  user.createdPrograms = user.createdPrograms.filter(
    pg => pg.toString() !== program._id.toString()
  );
  await user.save({ validateBeforeSave: false });
  if (req.user._id.toString() == program.customer || req.user.role == 'admin') {
    program = await Program.findByIdAndDelete(program._id, {
      active: false
    });
    const invitedResearchers = program.invited;
    await forEach(invitedResearchers, async researcher => {
      let user = await User.findById(researcher);
      user.programInvitations = user.programInvitations.filter(
        invProgram => invProgram.toString() !== program._id.toString()
      );
      user = await user.save({ validateBeforeSave: false });
      //console.log('USERSSSSSQWERTY', user);
    });
    res.status(204).json({
      status: 'success',
      data: null
    });
  } else {
    res.status(403).json({
      status: 'You dont have persmission to delete this program',
      data: null
    });
  }
});
exports.approveProgram = catchAsync(async (req, res, next) => {
  let program = await Program.findById(req.params.programId);
  if (!program) {
    return next(new AppError('Please enter a valid program id', 400));
  }
  program.isApproved = true;
  program = await program.save();

  return res.status(201).json({
    status: 'success',
    message: 'Pragram has successfully been approved',
    data: program
  });
});

exports.sendInvitations = catchAsync(async (req, res, next) => {
  if (!req.body.users)
    return next(
      new AppError('Please provide us a list of security researchers', 404)
    );
  let program = await Program.findById(req.params.programId);
  if (!program)
    return next(new AppError('Please enter a valid program id', 400));

  if (program.isApproved === false)
    return next(
      new AppError(
        'Please get the program approved to invite Security Reseachers',
        400
      )
    );
  let users = await User.find({ role: 'security-researcher' });
  if (users.length === 0)
    return next(new AppError('No Security Researchers found', 404));

  let invitedUsers = users.map(user => {
    if (req.body.users.includes(user._id.toString())) return user._id;
  });

  invitedUsers = invitedUsers.filter(el => el != undefined);

  program.invited = [...invitedUsers];
  // program.invited = program.invited.reduce(function(a, b) {
  //   if (a.indexOf(b) < 0) a.push(b);
  //   return a;
  // }, []);
  program.invited = [...new Set(program.invited)];
  // console.log('INVITED USERS, INVITED PROGRAMS', invitedUsers, program.invited);
  for (i = 0; i < users.length; i++) {
    if (
      users[i].role === 'security-researcher' &&
      invitedUsers.includes(users[i]._id) &&
      !users[i].programInvitations.includes(req.params.programId)
    ) {
      users[i].programInvitations = [
        req.params.programId,
        ...users[i].programInvitations
      ];
      await users[i].save({ validateBeforeSave: false });
    }
  }
  program = await program.save();
  console.log(program);
  return res.status(201).json({
    status: 'success',
    message:
      'You have successfully invited Security-Reseachers in this program',
    data: program
  });
});

exports.getEnrolled = catchAsync(async (req, res, next) => {
  const program = await Program.findById(req.params.programId);
  if (!program)
    return next(new AppError('Please enter a valid program id', 400));

  if (program.enrolled.includes(req.user._id))
    return next(new AppError('You are already enrolled in this program', 403));
  if (!program.ispublic && !program.invited.includes(req.user._id))
    return next(
      new AppError('You donot have permission to enroll in this program', 403)
    );

  if (program.invited.includes(req.user._id)) {
    program.invited = program.invited.filter(
      inviteId => !(inviteId.toString() === req.user._id.toString())
    );
  }
  program.enrolled = [req.user._id, ...program.enrolled];
  req.user.programsEnrolled = [program._id, ...req.user.programsEnrolled];
  if (req.user.programInvitations.includes(program._id)) {
    req.user.programInvitations = req.user.programInvitations.filter(
      programId => !(programId.toString() === program._id.toString())
    );
  }
  await program.save();
  await req.user.save({ validateBeforeSave: false });
  return res.status(201).json({
    stauts: 'success',
    message: 'You are successfully enrolled in this program'
  });
});

exports.getInvitedPrograms = catchAsync(async (req, res, next) => {
  let programs = req.user.programInvitations;
  programs = await Program.find({ _id: programs }).populate('customer', 'name');
  return res.status(200).json({
    status: 'success',
    data: {
      programs
    }
  });
});

exports.getEnrolledPrograms = catchAsync(async (req, res, next) => {
  let programs = req.user.programsEnrolled;
  programs = await Program.find({ _id: programs })
    .populate('customer', 'name')
    .populate('enrolled', 'programsSubmitted');

  // programs.forEach(program => {
  //   program.enrolled = [].concat.apply([], program.enrolled);
  // });
  // console.log('PROGRAM **!**', programs);
  // programs = programs.filter(program =>
  //   program.enrolled.some(pg => pg)
  // );
  return res.status(200).json({
    status: 'success',
    data: {
      programs
    }
  });
});

exports.getUnenrolled = catchAsync(async (req, res, next) => {
  const programId = req.params.programId;
  const userId = req.user.id;
  let program = await Program.findById(programId);
  let user = await User.findById(userId);
  if (!program || !user) return next(new AppError('Invalid information!', 403));
  console.log('INFO***', program, user);
  program.enrolled = program.enrolled.filter(
    user => user.toString() !== userId.toString()
  );
  program = await program.save();
  user.programsEnrolled = user.programsEnrolled.filter(
    program => program.toString() !== programId.toString()
  );
  const submission = await Submission.findOneAndDelete({
    programId,
    researcherId: user._id
  });

  if (submission) {
    user.programsSubmitted = user.programsSubmitted.filter(program => {
      return program.toString() !== submission._id.toString();
    });
  }
  user = await user.save({ validateBeforeSave: false });

  console.log('DATA AFTER CHANGING', program, user);
  return res.status(201).json({ success: true });
});
