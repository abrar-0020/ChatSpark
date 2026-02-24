const bcrypt = require('bcryptjs');
const FileStorage = require('../storage/fileStorage');

// File-based storage (persists on local disk)
const storage = new FileStorage('users');
const users = storage.getAll();

// Find highest ID to continue counter
let userIdCounter = users.length > 0 
  ? Math.max(...users.map(u => parseInt(u._id) || 0)) + 1 
  : 1;

class User {
  constructor(data) {
    this._id = data._id || String(userIdCounter++);
    this.username = data.username;
    this.email = data.email ? data.email.toLowerCase() : '';
    this.password = data.password;
    this.avatar = data.avatar || null;
    this.status = data.status || 'offline';
    this.customStatus = data.customStatus || '';
    this.aboutMe = data.aboutMe || '';
    this.servers = data.servers || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    // Validate
    if (!this.username || this.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!this.email || !/^\S+@\S+\.\S+$/.test(this.email)) {
      throw new Error('Please enter a valid email');
    }
    
    // Check if this is an existing user
    const existingUserIndex = users.findIndex(u => u._id === this._id);
    const isNewUser = existingUserIndex === -1;
    
    // Only validate password for new users or when password is provided
    if (isNewUser && (!this.password || this.password.length < 6)) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // For existing users, only validate password if it's being changed
    if (!isNewUser && this.password && this.password.length < 6 && !this.password.startsWith('$2a$')) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check for duplicates (only if new or username/email changed)
    const duplicateUser = users.find(u => u._id !== this._id && (u.username === this.username || u.email === this.email));
    if (duplicateUser) {
      throw new Error('Username or email already exists');
    }

    // Hash password if provided and not already hashed
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }

    // Update timestamp
    this.updatedAt = new Date();

    // Add or update - use object spread to preserve all fields
    const index = users.findIndex(u => u._id === this._id);
    if (index >= 0) {
      // Update existing user - preserve reference and update fields
      Object.assign(users[index], {
        username: this.username,
        email: this.email,
        password: this.password,
        avatar: this.avatar,
        status: this.status,
        customStatus: this.customStatus,
        aboutMe: this.aboutMe,
        servers: this.servers,
        updatedAt: this.updatedAt
      });
    } else {
      users.push(this);
    }

    // Save to disk
    storage.save(users);

    return this;
  }

  async comparePassword(candidatePassword) {
    if (!candidatePassword || !this.password) {
      return false;
    }
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }

  static async findById(id) {
    const user = users.find(u => u._id === id);
    return user ? new User(user) : null;
  }

  static async findOne(query) {
    const user = users.find(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
    return user ? new User(user) : null;
  }

  static async find(query = {}) {
    return users.filter(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    }).map(u => new User(u));
  }

  static async updateMany(query, update) {
    let count = 0;
    for (const user of users) {
      let match = true;
      for (let key in query) {
        if (key === 'servers' && Array.isArray(user.servers)) {
          if (!user.servers.includes(query[key])) {
            match = false;
            break;
          }
        } else if (user[key] !== query[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        // Handle $pull operator
        if (update.$pull) {
          for (let key in update.$pull) {
            if (Array.isArray(user[key])) {
              user[key] = user[key].filter(item => item !== update.$pull[key]);
            }
          }
        }
    // Save to disk
    storage.save(users);
        count++;
      }
    }
    return { modifiedCount: count };
  }

  static select(fields) {
    return this; // Simplified - just return this for chaining
  }
}

module.exports = User;
