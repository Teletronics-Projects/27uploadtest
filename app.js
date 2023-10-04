const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const app = express();

// MySQL database connection configuration
const db = mysql.createPool({
  host: 'apphostdbserver.mysql.database.azure.com',
  user: 'AzureAdmin',
  password: 'Itumeleng@1996',
  database: 'apphostdb',
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
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

// Define a route to retrieve files from the database
app.get('/files', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT * FROM files');
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving files.');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});