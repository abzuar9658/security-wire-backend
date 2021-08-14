const Submissions = require('./../models/submissionModel');
const Program = require('./../models/programModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.cwd()}/public/submissions`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.endsWith('pdf')) cb(null, true);
  else cb(new AppError('Not a PDF file, please upload pdf only.', 400), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPOC = upload.single('file');

exports.getAllSubmissions = catchAsync(async (req, res, next) => {
  const submissions = await Submissions.find();
  return res.status(200).json({
    status: 'success',
    data: submissions
  });
});

exports.getSubmissionsByProgram = catchAsync(async (req, res, next) => {
  const program = Program.findOne(req.params.programId);
  if (!program)
    return next(
      new AppError(`No Program was found by the id: ${req.params.programId}`)
    );
  if (program.customer !== req.user.id)
    return next(
      new AppError(
        "Only the customer who created the program can see it's submissions"
      )
    );
  const submissions = await Submissions.find({
    programId: req.params.programId
  });
  return res.status(200).json({
    status: 'success',
    data: submissions
  });
});

exports.postNewSubmission = catchAsync(async (req, res, next) => {
  let isUser = req.user.programsEnrolled.some(
    program => program.toString() === req.params.programId.toString()
  );

  if (!isUser)
    return next(
      new AppError(
        'You are not enrolled in this program, please get enrolled to post a submission'
      ),
      400
    );
  let body = {
    programId: req.params.programId,
    researcherId: req.user.id,
    endPointUrl: req.body.endPointUrl
  };
  if (req.file) body.poc = req.file.filename;
  const submission = await Submissions.create(body);
  res.status(201).json({
    status: 'success',
    data: submission
  });
});
