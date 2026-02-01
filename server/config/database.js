const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n⚠️  Falling back to in-memory storage...');
    console.log('💡 To enable MongoDB persistence:');
    console.log('   1. Install MongoDB locally or use MongoDB Atlas');
    console.log('   2. Update MONGODB_URI in your .env file');
    console.log('   3. Restart the server\n');
    return null;
  }
};

module.exports = connectDB;
