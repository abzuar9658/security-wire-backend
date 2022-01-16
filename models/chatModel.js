const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatModel = new Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: [true, 'message is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Chat', ChatModel);
