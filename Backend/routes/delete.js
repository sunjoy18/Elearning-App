const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require("../models/CM");
require('dotenv').config();
const mongoose = require("mongoose");
const multer = require('multer');
const fetchUser = require('../middleware/fetchUser');

mongoose.connect(process.env.URI);

// delete files from db 
let chunksCollection;
let filesCollection;
mongoose.connection.once('open', () => {
    const db = mongoose.connection.db;
    chunksCollection = db.collection(`fs.chunks`);
    filesCollection = db.collection(`fs.files`);

});

function getFileExtension(filename) {
    // Use a regular expression to extract the file extension
    const extension = /(?:\.([^.]+))?$/.exec(filename)[1];
    return extension ? extension.toLowerCase() : null;
}

//  To delete whole course . Login
router.delete("/course/:name", async (req, res) => {
    try {
        const courseName = req.params.name;
        const course = await Course.findOne({ name: courseName });
        console.log(courseName);
        const courseId = course._id;
        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        try {
            const filename = course.image;
            let name = await filesCollection.findOne({ filename: filename })
            if (name) {
                var fileId = name._id;
                console.log(fileId);
            }
            let stat = await filesCollection.findOneAndDelete({ filename });
            if (stat) {
                await chunksCollection.deleteMany({ files_id: fileId });
            }

        } catch (error) {
            console.error(`Unexpected error: ${error.message}`);
            return res.status(500).json({ error: 'Unexpected error' });
        }

        // console.log(course.modules.units.chapters.length);
        for (let a = 0; a < course.modules.length; a++) {
            for (let b = 0; b < course.modules[a].units.length; b++) {
                for (let i = 0; i < course.modules[a].units[b].chapters.length; i++) {
                    let notes = course.modules[a].units[b].chapters[i].contents.notes;

                    for (let k = 0; k < notes.length; k++) {
                        const filename = notes[k];

                        try {
                            let name = await filesCollection.findOne({ filename: filename })
                            if (name) {
                                var fileId = name._id;
                                console.log(fileId);
                            }
                            let stat = await filesCollection.findOneAndDelete({ filename });
                            if (stat) {
                                await chunksCollection.deleteMany({ files_id: fileId });
                            }

                        } catch (error) {
                            console.error(`Unexpected error: ${error.message}`);
                            return res.status(500).json({ error: 'Unexpected error' });

                        }
                    }
                }
            }
        }

        let courseDeleted = await Course.findByIdAndDelete({ _id: courseId });
        if (courseDeleted) {

            await User.updateMany(
                { enrolled: { courseName } },
                { $pull: { enrolled: courseName } }
            );
            res.status(200).json({ message: 'All files deleted successfully' });
        }

    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  To delete whole course > module . Login
router.delete("/course/module/:courseName/:moduleName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        // console.log(course.modules.units.chapters.length);
        for (let a = 0; a < course.modules.length; a++) {
            if (course.modules[a].name === moduleName) {
                for (let b = 0; b < course.modules[a].units.length; b++) {
                    for (let i = 0; i < course.modules[a].units[b].chapters.length; i++) {
                        let notes = course.modules[a].units[b].chapters[i].contents.notes;

                        for (let k = 0; k < notes.length; k++) {
                            const filename = notes[k];

                            try {
                                let name = await filesCollection.findOne({ filename: filename })
                                if (name) {
                                    var fileId = name._id;
                                    console.log(fileId);
                                }
                                let stat = await filesCollection.findOneAndDelete({ filename });
                                if (stat) {
                                    await chunksCollection.deleteMany({ files_id: fileId });
                                }

                            } catch (error) {
                                console.error(`Unexpected error: ${error.message}`);
                                return res.status(500).json({ error: 'Unexpected error' });

                            }
                        }
                    }
                }
            }
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { name: courseName },
            { $pull: { modules: { name: moduleName } } },
            { new: true }
        );

        if (updatedCourse) {

            console.log(`Module '${moduleName}' deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Files Deleted" })
        } else {
            console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }

    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  To delete whole course > module > unit . Login
router.delete("/course/unit/:courseName/:moduleName/:unitName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const unitName = req.params.unitName;
        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        for (let a = 0; a < course.modules.length; a++) {
            if (course.modules[a].name === moduleName) {

                for (let b = 0; b < course.modules[a].units.length; b++) {
                    if (course.modules[a].units[b].name === unitName) {
                        for (let i = 0; i < course.modules[a].units[b].chapters.length; i++) {
                            let notes = course.modules[a].units[b].chapters[i].contents.notes;

                            for (let k = 0; k < notes.length; k++) {
                                const filename = notes[k];

                                try {
                                    let name = await filesCollection.findOne({ filename: filename })
                                    if (name) {
                                        var fileId = name._id;
                                        console.log(fileId);
                                    }
                                    let stat = await filesCollection.findOneAndDelete({ filename });
                                    if (stat) {
                                        await chunksCollection.deleteMany({ files_id: fileId });
                                    }

                                } catch (error) {
                                    console.error(`Unexpected error: ${error.message}`);
                                    return res.status(500).json({ error: 'Unexpected error' });

                                }
                            }
                        }
                    }
                }

            }
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { name: courseName },
            {
                $pull: {
                    'modules.$[mod].units': { name: unitName },
                }
            },
            {
                arrayFilters: [
                    { 'mod.name': moduleName }
                ],
                new: true
            }
        );

        if (updatedCourse) {
            console.log(`Unit '${unitName}' deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Files Deleted" })
        } else {
            // console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }


    } catch (error) {
        console.error('Error deleting unit and files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  To delete whole course > module > unit > chapterName . Login
router.delete("/course/chapter/:courseName/:moduleName/:unitName/:chapterName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const unitName = req.params.unitName;
        const chapterName = req.params.chapterName;
        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        for (let a = 0; a < course.modules.length; a++) {
            if (course.modules[a].name === moduleName) {
                for (let b = 0; b < course.modules[a].units.length; b++) {
                    if (course.modules[a].units[b].name === unitName) {
                        for (let i = 0; i < course.modules[a].units[b].chapters.length; i++) {
                            if (course.modules[a].units[b].chapters[i].name === chapterName) {
                                let notes = course.modules[a].units[b].chapters[i].contents.notes;

                                for (let k = 0; k < notes.length; k++) {
                                    const filename = notes[k];

                                    try {
                                        let name = await filesCollection.findOne({ filename: filename })
                                        if (name) {
                                            var fileId = name._id;
                                            console.log(fileId);
                                        }
                                        let stat = await filesCollection.findOneAndDelete({ filename });
                                        if (stat) {
                                            await chunksCollection.deleteMany({ files_id: fileId });
                                        }

                                    } catch (error) {
                                        console.error(`Unexpected error: ${error.message}`);
                                        return res.status(500).json({ error: 'Unexpected error' });

                                    }
                                }
                            }
                        }
                    }
                }

            }
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { name: courseName },
            {
                $pull: {
                    'modules.$[mod].units.$[uni].chapters': { name: chapterName },
                }
            },
            {
                arrayFilters: [
                    { 'mod.name': moduleName },
                    { 'uni.name': unitName },
                ],
                new: true
            }
        );

        if (updatedCourse) {
            console.log(`Chapter '${chapterName}' deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Files Deleted" })
        } else {
            // console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }

    } catch (error) {
        console.error('Error deleting chapter and files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// To delete notes
router.delete("/course/file/:courseName/:moduleName/:unitName/:chapterName/:fileName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const unitName = req.params.unitName;
        const chapterName = req.params.chapterName;
        const fileName = req.params.fileName;
        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        // console.log(course.modules.units.chapters.length);
        for (let a = 0; a < course.modules.length; a++) {
            if (course.modules[a].name === moduleName) {
                for (let b = 0; b < course.modules[a].units.length; b++) {
                    for (let i = 0; i < course.modules[a].units[b].chapters.length; i++) {
                        let notes = course.modules[a].units[b].chapters[i].contents.notes;

                        for (let k = 0; k < notes.length; k++) {
                            const filename = notes[k];

                            try {
                                let name = await filesCollection.findOne({ filename: filename })
                                if (name) {
                                    var fileId = name._id;
                                    console.log(fileId);
                                }
                                let stat = await filesCollection.findOneAndDelete({ filename });
                                if (stat) {
                                    await chunksCollection.deleteMany({ files_id: fileId });
                                }

                            } catch (error) {
                                console.error(`Unexpected error: ${error.message}`);
                                return res.status(500).json({ error: 'Unexpected error' });

                            }
                        }
                    }
                }
            }
        }

        let updatedCourse = await Course.findOneAndUpdate(
            {
                name: courseName,
                'modules.name': moduleName
            },
            {
                $pull: {
                    'modules.$[mod].units.$[uni].chapters.$[chap].contents.notes': fileName
                }
            },
            {
                arrayFilters: [
                    { "mod.name": moduleName },
                    { "uni.name": unitName },
                    { "chap.name": chapterName },

                ],
                new: true
            }

        );


        if (updatedCourse) {
            console.log(`file '${moduleName}' deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Files Deleted" })
        } else {
            console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }

    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// To delete Videos
router.delete("/course/video/:courseName/:moduleName/:unitName/:chapterName/:videoName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const unitName = req.params.unitName;
        const chapterName = req.params.chapterName;
        const videoName = req.params.videoName;
        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }


        let updatedCourse = await Course.findOneAndUpdate(
            {
                name: courseName,
                'modules.name': moduleName
            },
            {
                $pull: {
                    'modules.$[mod].units.$[uni].chapters.$[chap].contents.videos': { name: videoName }
                } 
            },
            {
                arrayFilters: [
                    { "mod.name": moduleName },
                    { "uni.name": unitName },
                    { "chap.name": chapterName },

                ],
                new: true
            }

        );
        

        if (updatedCourse) {
            console.log(`file '${moduleName}' deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Files Deleted" })
        } else {
            console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }

    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//  To delete quiz . Login
router.delete("/course/quiz/:courseName/:moduleName/:unitName/:chapterName/:questionName", async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const moduleName = req.params.moduleName;
        const unitName = req.params.unitName;
        const chapterName = req.params.chapterName;
        const questionName = req.params.questionName + "?";

        console.log(courseName, moduleName, unitName, chapterName, questionName);


        const course = await Course.findOne({ name: courseName });

        if (!course) {
            return res.status(404).json({ "message": "Course not found" });
        }

        let updatedCourse = await Course.findOneAndUpdate(
            {
                name: courseName,
            },
            {
                $pull: {
                    'modules.$[mod].units.$[uni].chapters.$[chap].contents.quiz.questions': { question: questionName }
                }
            },
            {
                arrayFilters: [
                    { "mod.name": moduleName },
                    { "uni.name": unitName },
                    { "chap.name": chapterName },
                ],
                new: true
            }
        );


        if (updatedCourse) {
            console.log(`Quiz deleted from course '${courseName}'.`);
            res.status(200).json({ message: "Quiz Deleted" })
        } else {
            console.log(`Course '${courseName}' or Module '${moduleName}' not found.`);
            res.status(500).json({ message: "Files Not Deleted" })
        }


    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;

