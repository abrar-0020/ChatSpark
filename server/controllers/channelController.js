const { Channel, Server, Message } = require('../models');

// @desc    Create a new channel
// @route   POST /api/servers/:serverId/channels
// @access  Private (owner/admin only)
const createChannel = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const { serverId } = req.params;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is owner or admin
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create channels'
      });
    }

    // Create channel
    const channel = new Channel({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      type: type || 'text',
      description,
      server: serverId,
      position: server.channels.length
    });
    await channel.save();

    // Add channel to server
    server.channels.push(channel._id);
    await server.save();

    res.status(201).json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating channel',
      error: error.message
    });
  }
};

// @desc    Get all channels for a server
// @route   GET /api/servers/:serverId/channels
// @access  Private
const getChannels = async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findById(serverId);

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

    const channels = await Channel.find({ server: serverId }).sort('position');

    res.json({
      success: true,
      channels
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching channels',
      error: error.message
    });
  }
};

// @desc    Get a single channel
// @route   GET /api/channels/:id
// @access  Private
const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching channel',
      error: error.message
    });
  }
};

// @desc    Update channel
// @route   PUT /api/channels/:id
// @access  Private (owner/admin only)
const updateChannel = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const server = await Server.findById(channel.server);

    // Check if user is owner or admin
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this channel'
      });
    }

    const updateData = {};
    if (name) updateData.name = name.toLowerCase().replace(/\s+/g, '-');
    if (description !== undefined) updateData.description = description;
    if (permissions) updateData.permissions = permissions;

    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      channel: updatedChannel
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating channel',
      error: error.message
    });
  }
};

// @desc    Delete channel
// @route   DELETE /api/channels/:id
// @access  Private (owner/admin only)
const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const server = await Server.findById(channel.server);

    // Check if user is owner or admin
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this channel'
      });
    }

    // Check if it's the last channel
    if (server.channels.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last channel in a server'
      });
    }

    // Remove channel from server
    server.channels = server.channels.filter(
      c => c.toString() !== req.params.id
    );
    await server.save();

    // Delete all messages in channel
    await Message.deleteMany({ channel: req.params.id });

    // Delete channel
    await Channel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting channel',
      error: error.message
    });
  }
};

module.exports = {
  createChannel,
  getChannels,
  getChannel,
  updateChannel,
  deleteChannel
};
