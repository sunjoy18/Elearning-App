const mongoose = require("mongoose");
const { GridFSBucket, Readable } = require('mongodb');
const multer = require('multer');
const stream = require('stream');
const { Video } = require("./models/User");
const Course = require("./models/CM");
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const mongoUri = "mongodb://admin:adminPassword@3.110.55.166:27017/elearning?authMechanism=DEFAULT";
const mongoUri = process.env.URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};



module.exports = { connectToMongo };
// module.exports = connectToMongo;