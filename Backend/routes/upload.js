const express = require("express");
const router = express.Router();
// const { upload } = require('../db');
const mongoose = require("mongoose");
const { GridFSBucket, MongoClient, ObjectId } = require("mongodb");
const Course = require("../models/CM");
const multer = require("multer");
const stream = require("stream");
const Grid = require("gridfs-stream");
require('dotenv').config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function getFileExtension(filename) {
  // Use a regular expression to extract the file extension
  const extension = /(?:\.([^.]+))?$/.exec(filename)[1];
  return extension ? extension.toLowerCase() : null;
}

router.post("/upload", upload.array("video", 5), async (req, res) => {
  try {
    const files = req.files;
    // console.log(files)
    const courseName = req.body.courseName.trimEnd();
    const moduleName = req.body.moduleName.trimEnd();
    const chapName = req.body.chapterName.trimEnd();
    const unitName = req.body.unitName.trimEnd();
    const minAnswer = req.body.min.trimEnd();

    const question = req.body.questions;
    const option = req.body.option;
    const ans = req.body.correctAnswer;
    // console.log(req.body.option[0].split(','));
    const Questions = [];

    let image;

    const videos = JSON.parse(req.body.videos);

    console.log(videos);

    //  && question[0] != ''
    if (question.length > 0) {
      for (let i = 0; i < question.length; i++) {
        if (question[i] == "") {
          continue;
        }
        Questions[i] = {
          question: question[i],
          options: option[i].split(","),
          correctAnswer: ans[i],
        };
      }
    }

    let course = await Course.findOne({ name: courseName });

    if (course) {
      for (const file of files) {
        const filename = file.originalname;
        const fileBuffer = file.buffer;

        uploadFileToGridFS(
          filename,
          fileBuffer,
          courseName,
          chapName,
          moduleName,
          unitName
        ).then((res) => console.log("Done"));
      }
    } else {
      // Create a new course
      if (question.length > 0) {
        for (const file of files) {
          let ext = getFileExtension(file.originalname);
          console.log(ext);
          console.log(file);
          if (ext == "png" || ext == "jpg" || ext == "jpeg") {
            image = file.originalname
          }
        }
        // console.log(image);
        Course.create({
          name: courseName,
          image: image,
          modules: {
            name: moduleName,
            units: {
              name: unitName,
              chapters: {
                name: chapName,
                minAnswer: minAnswer,
                contents: {
                  quiz: {
                    questions: Questions.map((que) => {
                      return que;
                    }),
                  },
                  videos: videos.map((video) => {
                    return {
                      name: video.name,
                      url: video.link,
                    };
                  }),
                  // videos: videos.map((vid) => { return vid })
                },
              },
            },
          },
        })
          .then((res) => {
            for (const file of files) {
              const filename = file.originalname;
              const fileBuffer = file.buffer;

              uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName, Questions)
                .then((res) => console.log("Done"));
            }
          })
          .catch((err) => console.log(err));
      } else {
        for (const file of files) {
          let ext = getFileExtension(file);
          if (ext == "png" || ext == "jpg" || ext == "jpeg") {
            image = file.originalname
          }
        }
        Course.create({
          name: courseName,
          image: image,
          modules: {
            name: moduleName,
            units: {
              name: unitName,
              chapters: {
                name: chapName,
              },
            },
          },
        })
          .then((res) => {
            for (const file of files) {
              const filename = file.originalname;
              const fileBuffer = file.buffer;

              uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName, Questions)
                .then((res) => console.log("Done"));
            }
          })
          .catch((err) => console.log(err));
      }
    }

    res.status(200).json({ message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Updating the content
router.post("/upload/content", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    // console.log("files", files);
    // console.log(req.body);
    const courseName = req.body.courseName.trimEnd();
    const moduleName = req.body.moduleName.trimEnd();
    const chapName = req.body.chapterName.trimEnd();
    const unitName = req.body.unitName.trimEnd();
    const minAnswer = req.body.min.trimEnd();

    const question = req.body.questions;
    const option = req.body.option;
    const ans = req.body.correctAnswer;
    // console.log(req.body.option[0].split(','));
    const Questions = [];

    //  && question[0] != ''
    if (question.length > 0 && question[0] != '') {
      for (let i = 0; i < question.length; i++) {
        if (question[i] == "") {
          continue;
        }
        Questions[i] = {
          question: question[i],
          options: option[i].split(","),
          correctAnswer: ans[i],
        };
      }
    }



    let course = await Course.findOne({ name: courseName });
    let image;
    if (course) {
      for (const file of files) {
        const filename = file.originalname;
        const fileBuffer = file.buffer;

        uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName)
          .then((res) => console.log("Done"));



        uploadQuiz(courseName, chapName, moduleName, unitName, Questions);
      }
    } else {
      // Create a new course
      for (const file of files) {
        let ext = getFileExtension(file);
        if (ext == "png" || ext == "jpg" || ext == "jpeg") {
          image = file.originalname
        }
      }
      Course.create({
        name: courseName,
        image: image,
        modules: {
          name: moduleName,
          units: {
            name: unitName,
            chapters: {
              name: chapName,
              minAnswer: minAnswer,
              contents: {
                quiz: {
                  questions: Questions.map((que) => {
                    return que;
                  }),
                },
              },
            },
          },
        },
      })
        .then((res) => {
          for (const file of files) {
            const filename = file.originalname;
            const fileBuffer = file.buffer;

            uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName)
              .then((res) => console.log("Done"));

            uploadQuiz(courseName, chapName, moduleName, unitName, Questions);
          }
        })
        .catch((err) => console.log(err));
    }

    res.status(200).json({ message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// upload file in db

const uploadFileToGridFS = async (filename, fileBuffer, courseName, chapterName, moduleName, unitName) => {
  try {
    console.log("Received courseName:", courseName);
    console.log("Received chapterName:", chapterName);
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "fs" });

    const uploadStream = bucket.openUploadStream(filename);
    const readableStream = stream.Readable.from([fileBuffer]);

    let ext = getFileExtension(filename);
    let noteName;
    let videoName;
    if (ext == "txt" || ext == "pdf" || ext == "pptx") {
      noteName = filename;
    } else if (ext == "mp4" || ext == "mov" || ext == "mkv") {
      videoName = filename;
    }


    // Step 1: Find the Chapter
    Course.findOne({ name: courseName })
      .then((course) => {
        if (!course) {
          console.log("Course not found.");
          return null;
        }

        // Step 2: Update the Chapter
        return Course.findOneAndUpdate(
          {
            name: courseName,
            "modules.name": moduleName,
            "modules.units.name": unitName,
            "modules.units.chapters.name": chapterName,
          },
          {
            $push: {
              "modules.$[mod].units.$[uni].chapters.$[chap].contents.videos": videoName,
              "modules.$[mod].units.$[uni].chapters.$[chap].contents.notes": noteName,
            },

            $setOnInsert: {
              __v: 0,
            },
          },

          {
            arrayFilters: [
              { "mod.name": moduleName },
              { "uni.name": unitName },
              { "chap.name": chapterName },
            ],
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      })
      .then((updatedCourse) => {
        if (updatedCourse) {
          console.log("Video added");
        }
      })
      .catch((err) => {
        console.error("Error adding video:", err);
      });

    readableStream.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    console.log("File uploaded to GridFS");
  } catch (error) {
    console.error("Error uploading file to GridFS:", error);
    throw error;
  }
};


const uploadQuiz = async (courseName, chapterName, moduleName, unitName, Questions) => {
  try {
    console.log("Received courseName:", courseName);
    console.log("Received chapterName:", chapterName);
    console.log(Questions[0].question)


    // Step 1: Find the Chapter
    Course.findOne({ name: courseName })
      .then((course) => {
        if (!course) {
          console.log("Course not found.");
          return null;
        }

        // Step 2: Update the Chapter
        return Course.findOneAndUpdate(
          {
            name: courseName,
            "modules.name": moduleName,
            "modules.units.name": unitName,
            "modules.units.chapters.name": chapterName,
          },
          {
            $set: {
              'modules.$[mod].units.$[uni].chapters.$[chap].contents.quiz': { questions: Questions },
            },

            $setOnInsert: {
              __v: 0,
            },
          },

          {
            arrayFilters: [
              { "mod.name": moduleName },
              { "uni.name": unitName },
              { "chap.name": chapterName },
            ],
            upsert: true,
            new: true,
          }
        );
      })
      .then((updatedCourse) => {
        if (updatedCourse) {
          console.log("Quiz added");
        }
      })
      .catch((err) => {
        console.error("Error adding quiz:", err);
      });

  } catch (error) {
    console.error("Error quiz", error);
    throw error;
  }
};

mongoose.connect(process.env.URI);

// GridFS setup
let bucket;

mongoose.connection.once("open", () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, { bucketName: "fs" });
  // console.log(bucket._filesCollection);
});

// router.get('/getVideo/:id', async (req, res) => {
//   try {
//     const videoId = req.params.id;

//     if (!videoId) {
//       return res.status(404).send('Video not found in URL');
//     }

//     const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(videoId));
//     downloadStream.on('error', () => {
//       res.status(404).send('Video not found');
//     });

//     res.setHeader('Content-Type', 'video/mp4');
//     downloadStream.pipe(res);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });
//  run video Api
router.get("/getFile/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return res.status(404).send("Filename not found in URL");
    }

    console.log("Attempting to retrieve video with filename:", filename);

    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on("error", (error) => {
      console.error("Error retrieving video:", error);
      res.status(404).send("Video not found");
    });

    res.setHeader("Content-Type", "video/mp4");
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getVideo/:courseName/:moduleName/:unitName/:chapterName/:videoname", async (req, res) => {
  try {
    const courseName = req.params.courseName;
    const moduleName = req.params.moduleName;
    const unitName = req.params.unitName;
    const chapterName = req.params.chapterName;
    const videoname = req.params.videoname;

    // if (!videoname) {
    //   return res.status(404).send("VideoName not found in URL");
    // }

    console.log("Attempting to retrieve video with filename:", videoname);

    const course = await Course.findOne({
      name: courseName,
      "modules.name": moduleName,
      "modules.units.name": unitName,
      "modules.units.chapters.name": chapterName,
      "modules.units.chapters.contents.videos.name": videoname,
    });

    if (course) {
      const module = course.modules.find(mod => mod.name === moduleName);
      const unit = module.units.find(uni => uni.name === unitName);
      const chapter = unit.chapters.find(chap => chap.name === chapterName);
      const video = chapter.contents.videos.find(vid => vid.name === videoname);

      if (video) {
        // Video link found
        console.log(video.url);
        return res.status(200).json({ videoLink: video.url });
      } else {
        console.log(`Video with name '${videoname}' not found in chapter '${chapterName}'.`);
        return null; // or throw an error if you prefer
      }
    } else {
      console.log(`Course with name '${courseName}' not found.`);
      return null; // or throw an error if you prefer
    }


  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// to be deleted
router.post("/createCourse", upload.array("video", 5), async (req, res) => {
  try {
    const files = req.files;
    const courseName = req.body.courseName.trimEnd();
    const moduleName = req.body.moduleName.trimEnd();
    const chapName = req.body.chapterName.trimEnd();
    const unitName = req.body.unitName.trimEnd();
    const minAnswer = req.body.min.trimEnd();

    const question = req.body.questions;
    const option = req.body.option;
    const ans = req.body.correctAnswer;
    const Questions = [];

    //  && question[0] != ''
    if (question.length > 0) {
      for (let i = 0; i < question.length; i++) {
        if (question[i] == "") {
          continue;
        }
        Questions[i] = {
          question: question[i],
          options: option[i].split(","),
          correctAnswer: ans[i],
        };
      }
    }
    console.log(courseName);
    console.log(moduleName);
    console.log(unitName);
    console.log(chapName);
    console.log(option);

    let course = await Course.findOne({ name: courseName });

    if (course) {
      console.log("Course Already Exist Cannot Create Another. Please Check For The Course Name !!")
    } else {
      // Create a new course
      if (question.length > 0) {
        Course.create({
          name: courseName,
          modules: {
            name: moduleName,
            units: {
              name: unitName,
              chapters: {
                name: chapName,
                minAnswer: minAnswer,
                contents: {
                  quiz: {
                    questions: Questions.map((que) => {
                      return que;
                    }),
                  },
                },
              },
            },
          },
        })
          .then((res) => {
            for (const file of files) {
              const filename = file.originalname;
              const fileBuffer = file.buffer;

              uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName)
                .then((res) => console.log("Course Created !!"));
            }
          })
          .catch((err) => console.log('Course Creation Error : ', err));
      } else {
        Course.create({
          name: courseName,
          modules: {
            name: moduleName,
            units: {
              name: unitName,
              chapters: {
                name: chapName,
              },
            },
          },
        })
          .then((res) => {
            for (const file of files) {
              const filename = file.originalname;
              const fileBuffer = file.buffer;

              uploadFileToGridFS(filename, fileBuffer, courseName, chapName, moduleName, unitName)
                .then((res) => console.log("Course Created !!"));
            }
          })
          .catch((err) => console.log('Course Creation Error : ', err));
      }
    }

    res.status(200).json({ message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;