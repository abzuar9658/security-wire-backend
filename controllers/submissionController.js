const Submissions = require('./../models/submissionModel');
const Program = require('./../models/programModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const path = require('path');
const uuid = require('uuidv4');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
  console.log('MY FILE', file);
  if (file.mimetype.endsWith('pdf')) cb(null, true);
  else cb(new AppError('Not a PDF file, please upload pdf only.', 400), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPOC = upload.single('file');

exports.downloadSubmission = catchAsync(async (req, res, next) => {
  console.log('REQ HEADERS', req.headers);
  const fileName = req.body.fileName;
  const file = path.join(process.cwd(), 'public', 'submissions', fileName);
  console.log('FILE PATH', file);

  if (file) return res.download(file);
  next(new AppError('No files found!', 304));
});

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

exports.getSubmissionsToApprove = catchAsync(async (req, res, next) => {
  const submissions = await Submissions.find({
    isApproved: false
  })
    .populate('researcherId', 'name')
    .populate('programId', 'title');
  return res.status(200).json({
    status: 'success',
    data: { submissions }
  });
});

exports.getSubmissionsByResearcher = catchAsync(async (req, res, next) => {
  const submissions = await Submissions.find({
    researcherId: req.user.id
  }).populate('programId', 'title');
  return res.status(200).json({
    status: 'success',
    data: {
      programs: submissions
    }
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
  const isAlreadyUploaded = await Submissions.find({
    programId: body.programId,
    researcherId: body.researcherId
  }).exec();
  console.log(isAlreadyUploaded);
  if (isAlreadyUploaded && isAlreadyUploaded.length > 0)
    return next(
      new AppError(
        'You already have submitted your findings for this program!',
        403
      )
    );
  const user = await User.findById(req.user.id);
  const submission = await Submissions.create(body);
  user.programsSubmitted = [...user.programsSubmitted, submission._id];
  await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: 'success',
    data: submission
  });
});

exports.updateSubmission = catchAsync(async (req, res, next) => {
  let submission = await Submissions.findById(req.params.submissionId);
  if (!submission)
    return next(new AppError('No Submission Found with this id', 400));
  if (req.user.id.toString() !== submission.researcherId.toString()) {
    return next(
      new AppError('You do not have permission to update this submission', 400)
    );
  }
  if (req.body.endPointUrl) submission.endPointUrl = req.body.endPointUrl;
  if (req.file) submission.poc = req.file.name;
  submission = await submission.save();

  res.status(201).json({
    status: 'success',
    data: submission
  });
});

exports.approveSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submissions.findOneAndUpdate(
    { _id: req.params.submissionId },
    { isApproved: true }
  );
  if (!submission)
    return next(new AppError('No Submission Found with this id', 400));
  res.status(201).json({
    status: 'success',
    data: submission
  });
});

exports.deleteSubmission = catchAsync(async (req, res, next) => {
  let submission = await Submissions.findById(req.params.submissionId);
  if (!submission)
    return next(new AppError('No Submission Found with this id', 403));

  if (submission.researcherId.toString() !== req.user.id.toString())
    return next(
      new AppError('Researcher who created the submission can delete only', 403)
    );

  submission = await Submissions.findByIdAndDelete(req.params.submissionId);

  res.status(204).json({
    status: 'deleted',
    data: null
  });
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const submission = await Submissions.findById(req.params.submissionId);
  if (!submission)
    return next(new AppError('No Submission found with this id', 400));

  if (!submission.isApproved)
    return next(
      new AppError(
        `Submission ${req.params.submissionId} is not approved yet!`,
        400
      )
    );
  // 2) Create checkout session
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   success_url: `${req.protocol}://${req.get('host')}`,
  //   cancel_url: `${req.protocol}://${req.get('host')}`,
  //   customer_email: req.user.email,
  //   client_reference_id: submission.researcherId.toString(),
  //   line_items: [
  //     {
  //       name: `${submission._id.toString()} Submission`,
  //       description: `Submission for ${
  //         req.user.id
  //       } to submission ${submission._id.toString()} `,
  //       amount: req.body.price,
  //       currency: 'usd',
  //       quantity: 1
  //     }
  //   ]
  // });

  // // 3) Create session as response
  // res.status(200).json({
  //   status: 'success',
  //   session
  // });
  console.log('Request:', req.body);

  let error;
  let status;
  try {
    const { program, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: program.vrt * 100,
        currency: 'usd',
        customer: customer.id,
        receipt_email: token.email,
        description: `Bug bounty for ${program.title}`,
        shipping: {
          name: token.card.name,
          address: {
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log('Charge:', { charge });
    status = 'success';
  } catch (error) {
    console.error('Error:', error);
    status = 'failure';
  }

  res.status(200).json({ error, status });
});
