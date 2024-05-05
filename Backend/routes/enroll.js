const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const User = require('../models/User');
const Course = require("../models/CM");

const router = express.Router();

router.put('/enroll/:name', fetchUser, async (req, res) => {
    let courseName = req.params.name;

    let user = await User.findOne({ username: req.user.username });

    if (user.enrolled.some(course => course.name === courseName)) {
        return res.status(400).json({ message: "User is already enrolled in this course" });
    }
    try {
        const course = await Course.findOne({ name: courseName });

        if (course) {
            let courseNew = JSON.parse(JSON.stringify(course));

            const enrolledCourse = {
                courseName: courseName,
                modules: courseNew.modules.map((mod, modIndex) => ({
                    moduleName: mod.name,
                    units: mod.units.map((uni, uniIndex) => ({
                        unitName: uni.name,
                        chapters: uni.chapters.map((chap, chapIndex) => ({
                            chapterName: chap.name,
                            completed: modIndex === 0 && uniIndex === 0 && chapIndex === 0, // Set completed to true for the first chapter of the first unit in the first module
                        })),
                    })),
                })),
            };
            

            const enrolled = await User.findOneAndUpdate(
                {
                    username: req.user.username
                },
                {
                    $push: {
                        'enrolled': { name: courseName },
                        'courseStatus': enrolledCourse,

                    },
                    $setOnInsert: {
                        __v: 0,
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            )

            if (enrolled) {
                return res.status(200).json({ message: "Enrolled" });
            }
            else {
                return res.status(500).json({ message: "Error" });
            }

        } else {
            console.log("Course not found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }

})

router.get('/enrolled', fetchUser, async (req, res) => {
    try {
        let user = await User.findOne({ username: req.user.username });
        let enrolledCourses = user.enrolled;
        res.send(enrolledCourses)
        console.log("done")
    } catch (error) {
        console.log("Error getting courses");
        res.status(500).json({ message: "Server error" })
    }

})


router.put('/enroll/module/:courseName/:moduleName', fetchUser, async (req, res) => {
    let courseName = req.params.courseName;
    let moduleName = req.params.moduleName;


    let user = await User.findOne({ username: req.user.username });

    console.log(user.courseStatus.modules);
    try {

        const enrolled = await User.findOneAndUpdate(
            {
                username: req.user.username,
                'courseStatus.courseName': courseName,
            },
            {
                $push: {

                    'courseStatus.$[cour].modules': { moduleName: moduleName }
                },
                $setOnInsert: {
                    __v: 0,
                }
            },
            {
                arrayFilters: [
                    { "cour.courseName": courseName },
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
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})

router.put('/enroll/module/unit/:courseName/:moduleName/:unitName', fetchUser, async (req, res) => {
    let courseName = req.params.courseName;
    let moduleName = req.params.moduleName;
    let unitName = req.params.unitName;

    let user = await User.findOne({ username: req.user.username });


    const enrolled = await User.findOneAndUpdate(
        {
            username: req.user.username
        },
        {
            $push: {

                'courseStatus.$[cour].moduleName.$[mod].unitName': { unitName: unitName },

            },

            $setOnInsert: {
                __v: 0,

            }

        },
        {
            arrayFilters: [
                { 'cour.name': courseName },
                { 'mod.name': moduleName },

            ],
            upsert: true,
            new: true
        }
    )

    if (enrolled) {
        return res.status(200).json({ message: "Enrolled" });
    }
    else {
        return res.status(500).json({ message: "Error" });
    }
})


router.put('/enroll/module/unit/chapter/:courseName/:moduleName/:unitName/:chapterName', fetchUser, async (req, res) => {
    try {
        // Extract parameters from the request
        let courseName = req.params.courseName;
        let moduleName = req.params.moduleName;
        let unitName = req.params.unitName;
        let chapterName = req.params.chapterName;

        console.log(courseName);
        console.log(moduleName);
        console.log(unitName);
        console.log(chapterName);

        // Fetch user data
        let user = await User.findOne({ username: req.user.username });

        // Update user with the completed course information
        const enrolled = await User.findOneAndUpdate(
            {
                username: req.user.username
            },
            {
                $push: {
                    'courseStatus.$[cour].moduleName.$[mod].unitName.$[uni].chapterName': chapterName
                },
                $setOnInsert: {
                    __v: 0
                }
            },
            {
                arrayFilters: [
                    { 'cour.courseName': courseName },
                    { 'mod.moduleName': moduleName },
                    { 'uni.unitName': unitName },
                ],
                upsert: true,
                new: true
            }
        );

        if (enrolled) {
            return res.status(200).json({ message: 'Enrolled' });
        } else {
            return res.status(500).json({ message: 'Error' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;