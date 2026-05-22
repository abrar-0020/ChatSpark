const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!rawUsername || rawUsername.length < 3 || rawUsername.length > 32) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-32 characters'
      });
    }

    if (!rawEmail || !/^\S+@\S+\.\S+$/.test(rawEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    if (!rawPassword || rawPassword.length < 6 || rawPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 6-128 characters'
      });
    }

    // Check if user already exists (check both email and username separately)
    const existingEmail = await User.findOne({ email: rawEmail });
    const existingUsername = await User.findOne({ username: rawUsername });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create user (use new User() and save() instead of User.create())
    const user = new User({
      username: rawUsername,
      email: rawEmail,
      password: rawPassword
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        servers: []
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    // Validate input
    if (!rawEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email: rawEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(rawPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update status to online
    user.status = 'online';
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        servers: user.servers || []
      }
    };

    console.log('[Login] Success for user:', user.username);
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        customStatus: user.customStatus,
        aboutMe: user.aboutMe,
        servers: user.servers || []
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, avatar, customStatus, aboutMe } = req.body;

    if (username && (username.length < 3 || username.length > 32)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-32 characters'
      });
    }
    if (customStatus && customStatus.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Custom status must be 128 characters or less'
      });
    }
    if (aboutMe && aboutMe.length > 1024) {
      return res.status(400).json({
        success: false,
        message: 'About Me must be 1024 characters or less'
      });
    }
    if (avatar && avatar.length > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Avatar data is too large'
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (customStatus !== undefined) updateData.customStatus = customStatus;
    if (aboutMe !== undefined) updateData.aboutMe = aboutMe;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    Object.assign(user, updateData);
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        customStatus: user.customStatus,
        aboutMe: user.aboutMe
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Update user status
// @route   PUT /api/auth/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'idle', 'dnd', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      status: user.status
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.status = 'offline';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateStatus,
  logout
};
