const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 15)}...` : 'undefined');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in newer versions of Mongoose
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      // useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);

    // Test the connection by checking collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Check if we can count documents in the Ticket collection
    try {
      const ticketCount = await mongoose.connection.db.collection('tickets').countDocuments();
      console.log('Number of tickets in database:', ticketCount);

      const changeCount = await mongoose.connection.db.collection('changes').countDocuments();
      console.log('Number of changes in database:', changeCount);
    } catch (err) {
      console.error('Error counting documents:', err);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
