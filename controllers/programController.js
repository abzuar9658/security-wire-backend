const Program = require('./../models//programModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const mongoose = require('mongoose');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createProgram = catchAsync(async (req, res, next) => {
      const newProgram = await Program.create({
        title: req.body.title,
        customer: req.user._id.toString(),
        intro: req.body.intro,
        photo: req.body.photo,
        inScope: req.body.inScope,
        outScope: req.body.outScope,
        vrt: {
          vrt1:req.body.vrt[0],
          vrt2:req.body.vrt[1],
          vrt3:req.body.vrt[2],
          vrt4:req.body.vrt[3]
        },
        invited:req.body.invited,
        photo:req.body.photo,
        detail:req.body.detail,
        active: req.body.active,
        ispublic: req.body.ispublic,
      });
      res.status(200).send(newProgram)
  });

exports.getPublicPrograms = catchAsync(async (req, res, next) => {
  const programs = await Program.find({ispublic: true, active: true});
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
  
  const programs = await Program.find({customer: req.user._id.toString()});
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
        program: programs
    }
  });
});

exports.getAllPrograms = catchAsync(async (req, res, next) => {
  const programs = await Program.find().sort('date');
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: {
        program: programs
    }
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
  const program = await Program.findById(req.params.id)
  if(!program){
    res.status(404).json({
      status: 'Program Not Found',
      data: null
    });
  }
  if(req.user._id.toString()==program.customer || req.user.role=='admin'){
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'title','customer','intro','photo','inScope','outScope','vrt','active','ispublic','invited','detail');

    // 3) Update user document
    const updatedProgram = await Program.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        Program: updatedProgram
      }
    });
    }
    else{
      res.status(403).json({
        status: 'You dont have persmission to update this program',
        data: null
      })
    }
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  const program = await Program.findById(req.params.id)
  if(!program){
    res.status(404).json({
      status: 'Program Not Found',
      data: null
    });
  }
  if(req.user._id.toString() == program.customer || req.user.role=='admin'){
    await Program.findByIdAndUpdate(program._id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
  else{
    res.status(403).json({
      status: 'You dont have persmission to delete this program',
      data: null
    });
  }
});
