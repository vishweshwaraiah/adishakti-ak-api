// file uploading, multer
const multer = require('multer');
const SharpMulter = require('sharp-multer');

const filenameFunction = (ogFilename, options) => {
  const { fileFormat } = options;
  return ogFilename + '_' + Date.now() + '.' + fileFormat;
};

const storage = SharpMulter({
  destination: (req, file, cb) => cb(null, 'assets/uploads'),
  imageOptions: {
    fileFormat: 'jpeg', // Desired format (jpeg, webp, png, etc.)
    quality: 50, // Set image quality (0-100)
    resize: { width: 500, height: 500 }, // Resize dimensions
  },
  watermarkOptions: {
    input: './assets/watermark.png',
    location: 'top-right',
  },
  filename: filenameFunction,
});

const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('File type not supported.'), false); // Reject the file
  }
};

const MulterUpload = multer({
  storage,
  fileFilter,
}).single('avatar');

module.exports = MulterUpload;
