const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String,
    
    }],
});

const chapterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    minAnswer: {
        type: Number,
    },
    contents: {
        videos: [{
            name: String,
            url: String,
        }],
        notes: [{
            type: String,
        }],
        quiz: quizSchema,
    },
});

const units = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    chapters: [chapterSchema],
})

const moduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    units: [units],
})


const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    modules: [moduleSchema],
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
