const mongoose = require('mongoose');
const User = require('./userModel');
const submissionSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Please provide program ID']
  },
  researcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide researcher ID']
  },
  endPointUrl: {
    type: String
    // required: [true, 'Please provide the URL where bug was found']
  },
  poc: {
    type: String,
    required: [true, 'Please provide proof of concept to verify your finding']
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
