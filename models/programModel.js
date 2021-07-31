const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter title of program'],
    max: 50
  },
  customer:{
    type: mongoose.ObjectId,
    required: [true, 'Please provide customer ID']
  },
  intro: {
    type: String,
    max: 500
  },
  date: {type: Date, default: Date.now},
  photo: String,
  detail: {
    type: String,
    max: 3000
  },
  inScope: {
    type: [String]
  },
  outScope: {
    type: [String]
  },
  createdAt: Date,
  vrt:{
    vrt1:{type: Number,max: 5},
    vrt2:{type: Number,max: 5},
    vrt3:{type: Number,max: 5},
    vrt4:{type: Number,max: 5}
  },
  active: {
    type: Boolean,
    default: true,
  },
  invited:{
    type: [mongoose.ObjectId]
  },
  ispublic:{
    type: Boolean,
    default: false
  }
});


const Program = mongoose.model('Program', programSchema);

module.exports = Program;
