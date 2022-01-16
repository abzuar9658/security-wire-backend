const mongoose = require('mongoose');

const scannerSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide customer ID']
  },
  date: { type: Date, default: Date.now },
  url:{type: String, default:"error"},
  data: {
    type: String,
    get: function(data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data;
      }
    },
    set: function(data) {
      return JSON.stringify(data);
    }
  },
  logs: {
    type: [String]
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'error'],
    default: 'active'
  }
});

scannerSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Scanner = mongoose.model('Scanner', scannerSchema);
module.exports = Scanner;
