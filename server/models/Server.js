const FileStorage = require('../storage/fileStorage');

// File-based storage (persists on local disk)
const storage = new FileStorage('servers');
const servers = storage.getAll();

// Find highest ID to continue counter
let serverIdCounter = servers.length > 0 
  ? Math.max(...servers.map(s => parseInt(s._id) || 0)) + 1 
  : 1;

// Helper to generate invite code
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class Server {
  constructor(data) {
    this._id = data._id || String(serverIdCounter++);
    this.name = data.name;
    this.description = data.description || '';
    this.icon = data.icon || null;
    this.owner = data.owner;
    this.members = data.members || [];
    this.channels = data.channels || [];
    this.inviteCode = data.inviteCode || generateInviteCode();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    // Validate
    if (!this.name || this.name.length < 2) {
      throw new Error('Server name must be at least 2 characters');
    }
    if (!this.owner) {
      throw new Error('Server must have an owner');
    }

    // Update timestamp
    this.updatedAt = new Date();

    // Add or update
    const index = servers.findIndex(s => s._id === this._id);
    if (index >= 0) {
      servers[index] = this;
    } else {
      servers.push(this);
    }

    // Save to disk
    storage.save(servers);

    return this;
  }

  static async findById(id) {
    const server = servers.find(s => s._id === id);
    return server ? new Server(server) : null;
  }

  static async findOne(query) {
    const server = servers.find(s => {
      for (let key in query) {
        if (s[key] !== query[key]) return false;
      }
      return true;
    });
    return server ? new Server(server) : null;
  }

  static async find(query = {}) {
    return servers.filter(s => {
      for (let key in query) {
        if (s[key] !== query[key]) return false;
      }
      return true;
    }).map(s => new Server(s));
  }

  static async findByIdAndDelete(id) {
    const index = servers.findIndex(s => s._id === id);
    if (index >= 0) {
      const deleted = servers[index];
      servers.splice(index, 1);
      // Save to disk
      storage.save(servers);
      return new Server(deleted);
    }
    return null;
  }

  static populate(field) {
    return this; // Simplified - just return this for chaining
  }
}

module.exports = Server;
