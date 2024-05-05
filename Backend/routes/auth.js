const express = require('express');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const xlsx = require("xlsx");
const multer = require('multer');
const { default: axios } = require('axios');

const router = express.Router();
const JWT_SECRET = "Thisismysecret";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/signup", [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('username', 'Enter a valid Username').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 3 }),
    body('schoolname', 'Enter a valid schoolname').isLength({ min: 3 }),
    body('mobile', 'Enter a valid mobail').isLength({ min: 3 }),
    body('gender', 'Enter a valid gender').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),

], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {

        let user = await User.findOne({ username: req.body.username })
        if (user) {
            return res.status(400).json({ success, error: "Username already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            schoolName: req.body.schoolname,
            password: hashPass,
            mobile: req.body.mobile,
            gender: req.body.gender,
        });

        const data = { user: { id: user.id, username: user.username } }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



router.post("/login", [
    body('username', 'Enter a valid Username').exists(),
    body('password', 'Enter a valid Password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success })
    }
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        success = true;
        const data = { user: { id: user.id, username: user.username } }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(200).json({ success, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

router.post('/upload-data', upload.single('file'), async (req, res) => {
    try {
        // Parse the Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const usersData = xlsx.utils.sheet_to_json(sheet);

        const host = process.env.HOST;

        // Now you have the usersData array, you can create users in your database
        // For simplicity, let's log the data
        console.log(usersData);
        if (usersData != null) {
            for (let i = 0; i < usersData.length; i++) {
                let formdata = usersData[i];
                let headers = {
                    "Content-Type": "application/json",
                }
                let user = await axios.post(`http://${host}:5000/api/auth/signup`, formdata, { headers })
                if (user) {
                    console.log("User Created Successfully");
                }
                else {
                    console.log("User not created successfully");
                }

            }
        }

        // Send a response to the client
        res.status(200).send('Users created successfully');
    } catch (error) {
        console.error('Error creating users:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post("/admin-signup", [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),

], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {

        let user = await Admin.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "Username already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);

        user = await Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: hashPass,
        });

        const data = { user: { id: user.id, email: user.email } }
        const adminName = user.name;
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken, adminName});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


router.post("/admin-login", [
    body('email', 'Enter a valid E-Mail').exists(),
    body('password', 'Enter a valid Password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success })
    }
    const { email, password } = req.body;
    try {
        let user = await Admin.findOne({ email });

        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        success = true;
        const data = { user: { id: user.id, email: user.email } }
        const authToken = jwt.sign(data, JWT_SECRET);
        const adminName = user.name;
        res.status(200).json({ success, authToken , adminName });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})



module.exports = router