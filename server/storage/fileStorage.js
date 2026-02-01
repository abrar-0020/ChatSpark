const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data storage directory');
}

class FileStorage {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, `${filename}.json`);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const content = fs.readFileSync(this.filepath, 'utf8');
        const parsed = JSON.parse(content);
        console.log(`✅ Loaded ${path.basename(this.filepath)}`);
        return parsed;
      }
    } catch (error) {
      console.error(`❌ Error loading ${this.filepath}:`, error.message);
    }
    return [];
  }

  save(data) {
    try {
      this.data = data;
      fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`❌ Error saving ${this.filepath}:`, error.message);
      return false;
    }
  }

  getAll() {
    return this.data;
  }

  findById(id) {
    return this.data.find(item => item._id === id || item._id === String(id));
  }

  findOne(query) {
    return this.data.find(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key].$regex) {
          const regex = new RegExp(query[key].$regex, query[key].$options || '');
          return regex.test(item[key]);
        }
        return item[key] === query[key];
      });
    });
  }

  find(query = {}) {
    if (Object.keys(query).length === 0) {
      return this.data;
    }
    
    return this.data.filter(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key].$regex) {
          const regex = new RegExp(query[key].$regex, query[key].$options || '');
          return regex.test(item[key]);
        }
        return item[key] === query[key];
      });
    });
  }

  insert(item) {
    this.data.push(item);
    this.save(this.data);
    return item;
  }

  update(id, updates) {
    const index = this.data.findIndex(item => item._id === id || item._id === String(id));
    if (index >= 0) {
      this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date() };
      this.save(this.data);
      return this.data[index];
    }
    return null;
  }

  delete(id) {
    const index = this.data.findIndex(item => item._id === id || item._id === String(id));
    if (index >= 0) {
      const deleted = this.data.splice(index, 1)[0];
      this.save(this.data);
      return deleted;
    }
    return null;
  }

  clear() {
    this.data = [];
    this.save(this.data);
  }
}

module.exports = FileStorage;
