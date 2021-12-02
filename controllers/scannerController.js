const Scan = require('./../models/scannerModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const {spawn} = require('child_process');
let {PythonShell} = require('python-shell')


exports.createScan = catchAsync(async (req, res, next) => {
    var dataToSend;
    // spawn new child process to call the python script
    try{
      const python1 = await spawn('python', ["../security-wire-backend/utils/scanner_module/scanner.py",req.body.url]);
      // collect data from script
    
    python1.stdout.on('data', function (data) {
        dataToSend = data.toString();
        dataToSend = JSON.parse(dataToSend)
        console.log('Pipe data from python script ...', dataToSend);
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
        const newScan = await Scan.create({
          status: "completed",
          data: dataToSend,
          customer: req.user._id
         });
        res.status(200).send
        });
      }
      catch(e){
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
  console.log("xama")
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
      data: null
    });
  } else {
    res.status(403).json({
      status: 'You dont have persmission to delete this Scan',
      data: null
    });
  }
});

