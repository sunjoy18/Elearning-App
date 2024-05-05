const express = require('express')
const db = require('./db');
const { GridFSBucket, MongoClient, ObjectId } = require('mongodb');

const cors = require('cors');

const { connectToMongo } = db;
connectToMongo();
const app = express()
const port = 5000
const host = process.env.HOST;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', require("./routes/auth"));
app.use('/api', require("./routes/upload"));
app.use('/api', require("./routes/update"));
app.use('/api', require("./routes/delete"));
app.use('/api', require("./routes/read"));
app.use('/api', require("./routes/enroll"));
app.use('/api', require("./routes/completed"));

// app.get('/', (req, res) => {
//     const uri = 'mongodb://127.0.0.1:27017/elearning';

//     // Database and collection names
//     const dbName = 'elearning';
//     const collectionName = 'fs';

//     // File name you're interested in
//     const filename = 'video-1.mp4';

//     async function logChunksDetails() {
//         const client = new MongoClient(uri);

//         try {
//             await client.connect();
//             console.log('Connected to the database');

//             const database = client.db(dbName);
//             const filesCollection = database.collection(`${collectionName}.files`);
//             const chunksCollection = database.collection(`${collectionName}.chunks`);

//             // Find the file ID
//             const file = await filesCollection.findOne({ filename: filename });
//             if (!file) {
//                 console.log('File not found');
//                 return;
//             }

//             const fileId = file._id;

//             // Retrieve and log details of each chunk
//             const cursor = chunksCollection.find({ files_id: fileId });
//             while (await cursor.hasNext()) {
//                 const chunk = await cursor.next();
//                 console.log('Chunk ID:', chunk._id);
//                 console.log('File ID:', chunk.files_id);
//                 console.log('Chunk Number:', chunk.n);
//                 // Add other details you want to log
//                 console.log('Data:', chunk.data.toString('base64')); // Assuming binary data
//                 console.log('------');
//             }

//         } finally {
//             await client.close();
//             console.log('Connection closed');
//         }
//     }

//     logChunksDetails();
// });

app.listen(port, host,() => {
    console.log(`Example app listening on port ${port}`)

})