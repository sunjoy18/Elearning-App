const express = require('express');
const { User } = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = 'Thisismysecret';

// Route for user signup
router.post("/signup", [
    // Express Validator checks for valid input
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('username', 'Enter a valid Username').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 3 }),
    body('schoolname', 'Enter a valid schoolname').isLength({ min: 3 }),
    body('mobile', 'Enter a valid mobile').isLength({ min: 3 }),
    body('gender', 'Enter a valid gender').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    // Validate input using Express Validator
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check if username already exists
        let user = await User.findOne({ username: req.body.username });
        if (user) {
            return res.status(400).json({ success, error: "Username already exists" });
        }

        // Hash the password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user in the database
        user = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            schoolName: req.body.schoolname,
            password: hashPass,
            mobile: req.body.mobile,
            gender: req.body.gender,
        });

        // Generate JWT token for authentication
        const data = { user: { id: user.id, username: user.username } };
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route for user login
router.post("/login", [
    // Express Validator checks for valid input
    body('username', 'Enter a valid Username').exists(),
    body('password', 'Enter a valid Password').exists()
], async (req, res) => {
    // Validate input using Express Validator
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success });
    }

    const { username, password } = req.body;
    try {
        // Find user by username
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        // Compare hashed passwords
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        // Generate JWT token for authentication
        success = true;
        const data = { user: { id: user.id, username: user.username } };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(200).json({ success, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
