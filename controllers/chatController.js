const Chat = require('./../models/chatModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getChat = catchAsync(async (req, res, next) => {
  const user1 = req.user._id;
  const user2 = req.params.userId;

  const chat = await Chat.find({
    user1: { $in: [user1, user2] },
    user2: { $in: [user1, user2] }
  });
  res.status(200).json({
    success: true,
    data: {
      chat
    }
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const user1 = req.user._id;
  const user2 = req.body.userId;
  const { message } = req.body;
  const chat = await Chat.create({
    user1,
    user2,
    message
  });
  if (chat) {
    return res.status(201).json({
      success: true
    });
  }
  next(new AppError('Something went wrong while sending message', 500));
});
