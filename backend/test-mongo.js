require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

console.log("Attempting to connect to:", uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 })
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED: ", err.message);
    process.exit(1);
  });
