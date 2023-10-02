const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise'); // Use mysql2 library
const app = express();

// MySQL database connection configuration
const db = mysql.createPool({
    host: 'telesitemysqlserver1.mysql.database.azure.com',
  user: 'apycujqhef',
  password: 'QA2657835lOM7385$',
  database: 'telesitemysqlserver1cls',
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use(express.static('uploads'));

// Define a route for uploading files
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const connection = await db.getConnection();
        const [rows] = await connection.execute('INSERT INTO files (filename) VALUES (?)', [req.file.originalname]);
        connection.release();
        res.status(200).send('File uploaded successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading file.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});






