const Messages = require('../models/messageModel');
const Chats = require('../models/chatModel');

module.exports = {
  Create: async (req, res) => {
    try {
      let message = {};
      message = await Messages.create(req.body);
      await Chats.updateOne(
        {
          _id: req.body.chatId
        },
        {
          $push: {
            messages: message
          }
        }
      );
      message = await Messages.findOne({ _id: message.id });
      return res.status(200).json({
        status: 'Successful',
        message: 'Successfully sent a messages',
        data: message
      });
    } catch (error) {
      return res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },
  Read: async (req, res) => {
    try {
      let messages = {};
      const id = req.params.id;
      messages = await Messages.findOne({ _id: id }, { password: 0 });
      return res.status(200).json({
        status: 'Successful',
        data: messages
      });
    } catch (error) {
      return res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },
  Update: async (req, res) => {
    try {
      const id = req.params.id;
      let message = {};
      message = await Messages.updateOne(
        { _id: id },
        {
          $set: req.body
        }
      );
      message = await Messages.findOne({ _id: id });
      return res.status(200).json({
        status: 'Successful',
        message: 'Successfully updated messages',
        data: message
      });
    } catch (error) {
      return res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },
  Delete: async (req, res) => {
    try {
      const id = req.params.id;
      await Chats.updateOne(
        { messages: id },
        {
          $pull: {
            messages: id
          }
        }
      );
      await Messages.remove({ _id: id });
      return res.status(200).json({
        status: 'Successful',
        message: 'Successfully Deleted messages'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },
  List: async (req, res) => {
    try {
      let messages = [];
      messages = await Messages.find({});
      return res.status(200).json({
        status: 'Successful',
        data: messages
      });
    } catch (error) {
      return res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  }
};
