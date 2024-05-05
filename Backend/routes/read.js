const express = require('express');
const router = express.Router();
// const { upload } = require('../db');
const mongoose = require("mongoose");
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
require('dotenv').config();

const storage = multer.memoryStorage();


const fetchUser  = require('../middleware/fetchUser');
const User = require('../models/User');
const Course = require('../models/CM');

mongoose.connect(process.env.URI);

// GridFS setup
let bucket;

mongoose.connection.once('open', () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, { bucketName: 'fs' });
  // console.log(bucket._filesCollection);
});

//  run video Api
router.get('/getVideo/:filename', async (req, res) => {
  try {

    const filename = req.params.filename;

    if (!filename) {
      return res.status(404).send('Filename not found in URL');
    }

    console.log('Attempting to retrieve video with filename:', filename);
    
    const downloadStream = bucket.openDownloadStreamByName(filename);
    
    downloadStream.on('error', (error) => {
      console.error('Error retrieving video:', error);
      res.status(404).send('Video not found');
    });

    // res.setHeader('Content-Type', 'video/mp4');
    const fileExtension = filename.split('.').pop().toLowerCase();
    console.log(fileExtension);

    let contentType = '';

    switch (fileExtension) {
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
        default:
          contentType = 'application/octet-stream';
        }
        
    res.setHeader('Content-Type', contentType);


    downloadStream.pipe(res);
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/getPdf/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (!filename) {
      return res.status(404).send('Filename not found in URL');
    }
    
    console.log('Attempting to retrieve video with filename:', filename);
    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on('error', (error) => {
      console.error('Error retrieving PDF:', error);
      res.status(404).send('PDF not found');
    });

    res.setHeader('Content-Type', 'application/pdf');

    downloadStream.pipe(res);

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/getUser', fetchUser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId);

    if (user) {
      res.send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/getCourses', async(req, res) => {
  try{
    // Get all courses from the database and send them as a response
    const courses = await Course.find();
    res.send(courses);
    console.log("Trying to fetch courses")
  }catch(error){
    console.log("Error getting courses");
    res.status(500).json({message:"Server error"})
  }
})


module.exports = router;
