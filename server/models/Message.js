// In-memory storage
const messages = [];
let messageIdCounter = 1;

// Query builder class for method chaining
class MessageQuery {
  constructor(results) {
    this._results = results;
    this._sortField = null;
    this._sortOrder = 1;
    this._limitCount = null;
  }

  sort(sortObj) {
    const key = Object.keys(sortObj)[0];
    this._sortField = key;
    this._sortOrder = sortObj[key];
    return this;
  }

  limit(num) {
    this._limitCount = num;
    return this;
  }

  populate(field) {
    // Simplified - just return this for chaining
    return this;
  }

  // Execute the query - can be awaited or use .then()
  async exec() {
    let result = [...this._results];
    
    if (this._sortField) {
      result.sort((a, b) => {
        const aVal = new Date(a[this._sortField]);
        const bVal = new Date(b[this._sortField]);
        return this._sortOrder === -1 ? bVal - aVal : aVal - bVal;
      });
    }
    
    if (this._limitCount !== null) {
      result = result.slice(0, this._limitCount);
    }
    
    return result;
  }

  // Make the query thenable (awaitable)
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

class Message {
  constructor(data) {
    this._id = data._id || String(messageIdCounter++);
    this.content = data.content;
    this.author = data.author;
    this.channel = data.channel;
    this.server = data.server;
    this.attachments = data.attachments || [];
    this.edited = data.edited || false;
    this.editedAt = data.editedAt || null;
    this.deleted = data.deleted || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    // Validate
    if (!this.content || this.content.length === 0) {
      throw new Error('Message content is required');
    }
    if (this.content.length > 2000) {
      throw new Error('Message cannot exceed 2000 characters');
    }
    if (!this.author) {
      throw new Error('Message must have an author');
    }
    if (!this.channel) {
      throw new Error('Message must belong to a channel');
    }
    if (!this.server) {
      throw new Error('Message must belong to a server');
    }

    // Update timestamp
    this.updatedAt = new Date();

    // Add or update
    const index = messages.findIndex(m => m._id === this._id);
    if (index >= 0) {
      messages[index] = this;
    } else {
      messages.push(this);
    }

    return this;
  }

  static async findById(id) {
    const message = messages.find(m => m._id === id);
    return message ? new Message(message) : null;
  }

  static async findOne(query) {
    const message = messages.find(m => {
      for (let key in query) {
        if (m[key] !== query[key]) return false;
      }
      return true;
    });
    return message ? new Message(message) : null;
  }

  // Returns a MessageQuery for chaining .sort().limit()
  static find(query = {}) {
    const results = messages.filter(m => {
      for (let key in query) {
        if (m[key] !== query[key]) return false;
      }
      return true;
    }).map(m => new Message(m));
    
    return new MessageQuery(results);
  }

  static async deleteMany(query = {}) {
    const toDelete = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      let match = true;
      for (let key in query) {
        if (messages[i][key] !== query[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        toDelete.push(i);
      }
    }
    toDelete.forEach(i => messages.splice(i, 1));
    return { deletedCount: toDelete.length };
  }
}

module.exports = Message;
