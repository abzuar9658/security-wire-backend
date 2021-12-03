const Scan = require('./../models/scannerModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const {spawn} = require('child_process');
let {PythonShell} = require('python-shell')


exports.createScan = catchAsync(async (req, res, next) => {
  console.log("scanning")
  console.log(req.body.url)
  try{
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {scanning: true} )
      var dataToSend;
      // spawn new child process to call the python script
     
        const python1 = await spawn('python', ["../security-wire-backend/utils/scanner_module/scanner.py",req.body.url]);
        // collect data from script
      
      python1.stdout.on('data', function (data) {
          console.log(data)
          dataToSend = data.toString();
          // console.log('Pipe data from python script ...', dataToSend);
      });
  
      python1.stderr.on('data',async (err_data) => {
        console.error(`child stderr:\n${data}`);
        const newScan = await Scan.create({
          status: "error",
          error: err_data,
          customer: req.user._id
       });
      });
        // in close event we are sure that stream from child process is closed
      python1.on('close',async (code) => {
      console.log(`child1 process close all stdio with code ${code}`);
      // send data to browser
      const updatedUser1 = await User.findByIdAndUpdate(req.user.id, {scanning: false} )
      const newScan = await Scan.create({
        status: "completed",
        data: dataToSend,
        customer: req.user._id
       });
      res.status(200).send
      });
  }
  catch(e){
    console.log(e)
    const updatedUser1 = await User.findByIdAndUpdate(req.user.id, {scanning: false} )
    res.status(500).send
  }
});


exports.getmyScans = catchAsync(async (req, res, next) => {
  const Scans = await Scan.find({ customer: req.user._id.toString(), deleted: false  });
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: Scans.length,
    data: {
      Scan: Scans
    }
  });
});

exports.status = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  // SEND RESPONSE
  res.status(200).json({
    status: user.scanning
  });
});

exports.getAllScans = catchAsync(async (req, res, next) => {
  const Scans = await Scan.find().sort('date');
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: Scans.length,
    data: {
      Scan: Scans
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const scan = await Scan.findById(req.params.id);
  if (!scan) {
    res.status(404).json({
      status: 'Scan Record Not Found',
      data: null
    });
  }
  if (req.user._id.toString() == scan.customer || req.user.role == 'admin') {
    await Scan.findByIdAndUpdate(scan._id, { deleted: true });
    res.status(204).json({
      status: 'success',
      data: 'success'
    });
  } else {
    res.status(403).json({
      status: 'You dont have persmission to delete this Scan',
      data: null
    });
  }
});

