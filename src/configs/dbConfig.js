const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    const dbOptions = {
      dbName: 'adishakti-kkmr',
    };
    await mongoose.connect(process.env.MONGODB_URL, dbOptions);
    console.log('Successfully Asynchronously connected to Mongo DB!');
  } catch (error) {
    console.log(error.message);
  }
};

dbConnect();
