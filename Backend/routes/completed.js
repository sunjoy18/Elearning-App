const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const User= require('../models/User');
const Course = require("../models/CM");

const router = express.Router();


// To mark user's completed chapter's . Login Required
router.put('/complete/chapter/:courseName/:moduleName/:unitName/:chapterName', fetchUser, async (req, res) => {
    let chapterName = req.params.chapterName;
    let courseName = req.params.courseName;
    let moduleName = req.params.moduleName;
    let unitName = req.params.unitName;
    if(req) {
        console.log("Request aaya")
    }

    try {
        const course = await Course.findOne(
            {
                name: courseName,
                "modules.name": moduleName,
                "modules.units.name": unitName
            }
        )

        if (course) {
            const completed = await User.findOneAndUpdate(
                {
                    username: req.user.username,
                    'courseStatus.courseName': courseName,
                    'courseStatus.modules.moduleName': moduleName,
                    'courseStatus.modules.units.unitName': unitName,
                    'courseStatus.modules.units.chapters.chapterName': chapterName
                },
                {
                    $set: {
                        'courseStatus.$.modules.$[mod].units.$[unit].chapters.$[chap].completed': true
                    },
                    $setOnInsert: {
                        __v: 0,
                    }
                },
                {
                    arrayFilters: [
                        { 'mod.moduleName': moduleName },
                        { 'unit.unitName': unitName },
                        { 'chap.chapterName': chapterName },
                    ],
                    upsert: true,
                    new: true
                }
            );

            if (completed) {
                return res.status(200).json({ message: "Chapter marked as completed" });
            } else {
                return res.status(500).json({ message: "Error updating chapter completion" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// To mark user's completed unit's . Login Required
router.put('/complete/unit/:courseName/:moduleName/:unitName', fetchUser, async (req, res) => {
    let courseName = req.params.courseName;
    let moduleName = req.params.moduleName;
    let unitName = req.params.unitName;

    try {

        const course = await Course.findOne(
            {
                name: courseName,
                "modules.name": moduleName,
                "modules.units.name": unitName
            }
        )

        if (course) {

            const enrolled = await User.findOneAndUpdate(
                {
                    username: req.user.username,
                    'courseStatus': {
                        $elemMatch: {
                            'courseName': courseName,
                            'modules.moduleName': moduleName,
                            'modules.units.unitName': unitName
                        }
                    }
                },
                {
                    $set: {
                        'courseStatus.$[cour].modules.$[mod].units.$[unit].completed': true
                    },
                    $setOnInsert: {
                        __v: 0,
                    }
                },
                {
                    arrayFilters: [
                        { "cour.courseName": courseName },
                        { "mod.moduleName": moduleName },
                        { "unit.unitName": unitName }
                    ],
                    upsert: true,
                    new: true
                }
            )

            if (enrolled) {
                return res.status(200).json({ message: "unit updated in enroll" });
            }
            else {
                return res.status(500).json({ message: "Error" });
            }
        }
        else {
            return res.status(404).json({message : "Unit not found"});
        }

    } catch (error) {
        console.log(error);
        res.send(error);
    }
})

// To mark user's completed modules . Login Required
router.put('/complete/module/:courseName/:moduleName', fetchUser, async (req, res) => {
    let courseName = req.params.courseName;
    let moduleName = req.params.moduleName;

    try {

        const course = await Course.findOne(
            {
                name: courseName,
                "modules.name": moduleName,
            }
        )

        if (course) {

            const enrolled = await User.findOneAndUpdate(
                {
                    username: req.user.username,
                    'courseStatus': {
                        $elemMatch: {
                            'courseName': courseName,
                            'modules.moduleName': moduleName
                        }
                    }
                },
                {
                    $set: {

                        'courseStatus.$[cour].modules.$[mod].completed': true
                    },
                    $setOnInsert: {
                        __v: 0,
                    }
                },
                {
                    arrayFilters: [
                        { "cour.courseName": courseName },
                        { "mod.moduleName": moduleName },
                    ],
                    upsert: true,
                    new: true
                }
            )

            if (enrolled) {
                return res.status(200).json({ message: "module updated in enroll" });
            }
            else {
                return res.status(500).json({ message: "Error" });
            }
        }
        else {
            return res.status(404).json({message : "Module not found"});
        }

    } catch (error) {
        console.log(error);
        res.send(error);
    }
})

// To mark user's completed course . Login Required
router.put('/complete/course/:courseName', fetchUser, async (req, res) => {
    
    let courseName = req.params.courseName;

    try {
        const course = await Course.findOne(
            {
                name: courseName,
            }
        )

        if (course) {
            const completed = await User.findOneAndUpdate(
                {
                    username: req.user.username,
                    'courseStatus.courseName': courseName,
                },
                {
                    $set: {
                        'courseStatus.$[cour].completed': true
                    },
                    $setOnInsert: {
                        __v: 0,
                    }
                },
                {
                    arrayFilters: [
                        { 'cour.courseName': courseName },
                    ],
                    upsert: true,
                    new: true
                }
            );

            if (completed) {
                return res.status(200).json({ message: "Course marked as completed" });
            } else {
                return res.status(500).json({ message: "Error updating chapter completion" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/complete/status', fetchUser, async (req, res) => {

    try {
        const user = await User.findOne(
            {
                username: req.user.username,
                
            }
        )

        if (user) {
            return res.status(200).json(user.courseStatus);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;