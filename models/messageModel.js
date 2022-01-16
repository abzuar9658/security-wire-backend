const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessagesModel = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      trim: true
    },
    media: [
      {
        url: {
          type: String,
          trim: true
        },
        type: {
          type: String,
          enum: ['video', 'image', 'document', 'audio'],
          trim: true
        },
        extension: {
          type: String,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const autoPopulate = function(next) {
  this.populate('vendor', '-password');
  this.populate('user', '-password');
  next();
};
MessagesModel.pre('find', autoPopulate).pre('findOne', autoPopulate);

module.exports = mongoose.model('Messages', MessagesModel);
