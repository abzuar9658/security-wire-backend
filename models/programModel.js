const mongoose = require('mongoose');
const validator = require('validator');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter title of program'],
    max: 50
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide customer ID']
  },
  intro: {
    type: String,
    max: 500
  },
  date: { type: Date, default: Date.now },
  photo: String,
  detail: {
    type: String,
    max: 3000
  },
  inScope: {
    type: [String],
    required: [true, 'Please enter atleast one inscope link for this program'],
    validate: [
      v => Array.isArray(v) && v.length > 0,
      'Please enter atleast one inscope link for this program'
    ]
  },
  outScope: {
    type: [String]
  },
  createdAt: Date,
  // vrt: {
  //     vrt1: { type: Number, max: 5 },
  //     vrt2: { type: Number, max: 5 },
  //     vrt3: { type: Number, max: 5 },
  //     vrt4: { type: Number, max: 5 }
  // },

  vrt: {
    type: [String],
    required: [true, 'Please enter atleast one vrt for this program'],
    validate: [
      v => Array.isArray(v) && v.length > 0,
      'Please enter atleast one vrt for this program'
    ]
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  invited: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ispublic: {
    type: Boolean,
    default: false
  }
});

// programSchema.pre(/^find/, function(next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

const Program = mongoose.model('Program', programSchema);
module.exports = Program;
