const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Successfully Asynchronously connected to Mongo DB!');
  } catch (error) {
    console.log(err.message);
  }
};

dbConnect();
