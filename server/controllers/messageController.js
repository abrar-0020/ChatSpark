const { Message, Channel, Server, User } = require('../models');

// @desc    Get messages for a channel
// @route   GET /api/channels/:channelId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const server = await Server.findById(channel.server);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is a member
    const isMember = server.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    // Get messages for the channel (not deleted)
    let messages = await Message.find({ channel: channelId, deleted: false })
      .sort({ createdAt: -1 })
      .limit(limitNum);

    // Filter by 'before' if provided
    if (before) {
      const beforeDate = new Date(before);
      messages = messages.filter(msg => new Date(msg.createdAt) < beforeDate);
    }

    // Manually populate author for each message
    const populatedMessages = [];
    for (const msg of messages) {
      const author = await User.findById(msg.author);
      populatedMessages.push({
        _id: msg._id,
        content: msg.content,
        author: author ? {
          _id: author._id,
          username: author.username,
          avatar: author.avatar,
          status: author.status
        } : { _id: msg.author, username: 'Unknown User', avatar: null },
        channel: msg.channel,
        server: msg.server,
        attachments: msg.attachments,
        edited: msg.edited,
        editedAt: msg.editedAt,
        deleted: msg.deleted,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      });
    }

    // Reverse to get chronological order
    res.json({
      success: true,
      messages: populatedMessages.reverse()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Create a message (REST fallback)
// @route   POST /api/channels/:channelId/messages
// @access  Private
const createMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const rawContent = typeof content === 'string' ? content.trim() : '';

    if (!rawContent) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (rawContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters'
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const server = await Server.findById(channel.server);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is a member
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    // Check write permission
    if (!channel.permissions.write.includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send messages in this channel'
      });
    }

    const message = new Message({
      content: rawContent,
      author: req.user._id,
      channel: channelId,
      server: channel.server
    });
    await message.save();

    const populatedMessage = await Message.findById(message._id);

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating message',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (message author only)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the author
    if (message.author.toString() !== req.user._id.toString()) {
      // Check if user is server admin/owner
      const server = await Server.findById(message.server);
      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Server not found'
        });
      }
      const member = server.members.find(
        m => m.user.toString() === req.user._id.toString()
      );

      if (!member || !['owner', 'admin'].includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own messages'
        });
      }
    }

    // Soft delete
    message.deleted = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private (message author only)
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const rawContent = typeof content === 'string' ? content.trim() : '';
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the author
    if (message.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    if (!rawContent) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    if (rawContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters'
      });
    }

    message.content = rawContent;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id);

    res.json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  editMessage
};
