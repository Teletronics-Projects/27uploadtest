const express = require('express');
const expressFileUpload = require('express-fileupload');
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

// Create an instance of the Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for file uploads
app.use(expressFileUpload());

// Azure Blob Storage configuration
const storageAccountName = 'apphoststorageacc1021';
const storageAccountKey = 'OD9gz8wA0nn5HGxK/Sb71R7lHQ88OklEsj3YMNMeVKkLQ3FCl44nftUgXqVowoLWZHboOia+0VQ1+AStGc0SNA=='; // Or use Managed Identity for authentication
const containerName = 'apphostfiles1021';

const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
const blobServiceClient = new BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net`, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Serve uploaded files
app.use('/files', express.static('uploads'));

// Upload route
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const uploadedFile = req.files.uploadedFile;
    const blobName = uploadedFile.name;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = uploadedFile.data;

    await blockBlobClient.uploadStream(stream, undefined, undefined, {
      blobHTTPHeaders: {
        blobContentType: uploadedFile.mimetype
      }
    });

    res.send('File uploaded successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file.');
  }
});

// Download route
app.get('/download/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const downloadResponse = await blockBlobClient.download();

    res.setHeader('Content-Type', downloadResponse.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading file.');
  }
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





// ... (rest of the code)


