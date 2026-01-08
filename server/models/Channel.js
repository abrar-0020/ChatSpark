// In-memory storage
const channels = [];
let channelIdCounter = 1;

class Channel {
  constructor(data) {
    this._id = data._id || String(channelIdCounter++);
    this.name = data.name;
    this.type = data.type || 'text';
    this.description = data.description || '';
    this.server = data.server;
    this.permissions = data.permissions || {
      read: ['owner', 'admin', 'member'],
      write: ['owner', 'admin', 'member']
    };
    this.position = data.position || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    // Validate
    if (!this.name || this.name.length < 1) {
      throw new Error('Channel name must be at least 1 character');
    }
    if (!this.server) {
      throw new Error('Channel must belong to a server');
    }

    // Set default permissions if not set
    if (!this.permissions.read || this.permissions.read.length === 0) {
      this.permissions.read = ['owner', 'admin', 'member'];
    }
    if (!this.permissions.write || this.permissions.write.length === 0) {
      this.permissions.write = ['owner', 'admin', 'member'];
    }

    // Update timestamp
    this.updatedAt = new Date();

    // Add or update
    const index = channels.findIndex(c => c._id === this._id);
    if (index >= 0) {
      channels[index] = this;
    } else {
      channels.push(this);
    }

    return this;
  }

  static async findById(id) {
    const channel = channels.find(c => c._id === id);
    return channel ? new Channel(channel) : null;
  }

  static async findOne(query) {
    const channel = channels.find(c => {
      for (let key in query) {
        if (c[key] !== query[key]) return false;
      }
      return true;
    });
    return channel ? new Channel(channel) : null;
  }

  static async find(query = {}) {
    return channels.filter(c => {
      for (let key in query) {
        if (c[key] !== query[key]) return false;
      }
      return true;
    }).map(c => new Channel(c));
  }

  static async findByIdAndDelete(id) {
    const index = channels.findIndex(c => c._id === id);
    if (index >= 0) {
      const deleted = channels[index];
      channels.splice(index, 1);
      return new Channel(deleted);
    }
    return null;
  }

  static async deleteMany(query = {}) {
    const toDelete = [];
    for (let i = channels.length - 1; i >= 0; i--) {
      let match = true;
      for (let key in query) {
        if (channels[i][key] !== query[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        toDelete.push(i);
      }
    }
    toDelete.forEach(i => channels.splice(i, 1));
    return { deletedCount: toDelete.length };
  }

  static populate(field) {
    return this; // Simplified - just return this for chaining
  }

  static sort(sortObj) {
    return this; // Simplified - just return this for chaining
  }
}

module.exports = Channel;
