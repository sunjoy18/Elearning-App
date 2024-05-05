const mongoose = require("mongoose");
const { Schema } = mongoose

const Completed = new Schema({

    courseName: {
        type: String,
        required: true
    },
    moduleName: [],
    unitName: [],
    chapterName: [],
    courseCompleted: {
        type: Boolean,
        default: false,
    },

})

const Enrolled = new Schema({
    name: {
        type: String,
        unique: false,
        default: "NONE"
    }
})


const chapterSchema = new Schema({
    chapterName: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const unitSchema = new Schema({
    unitName: { type: String, required: true },
    chapters: [chapterSchema],
    completed: { type: Boolean, default: false }
});

const moduleSchema = new Schema({
    moduleName: { type: String, required: true },
    units: [unitSchema],
    completed: { type: Boolean, default: false }
});

const courseSchema = new Schema({
    courseName: { type: String, required: true },
    modules: [moduleSchema],
    completed: { type: Boolean, default: false }
});

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    schoolName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    enrolled: {
        type: [{
            name: {
                type: String,
            }
        }],
    },
    courseStatus: [courseSchema]
})





const Courses = new Schema({
    courseName: String,
    videos: []
});

const Videos = new Schema({

    filename: String,


})

const User = mongoose.model('User', UserSchema);
const Video = mongoose.model('Videos', Videos);
const Course = mongoose.model('Courses', Courses);

module.exports = User