const fs = require('fs');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const sharp = require('sharp');
const User = require('@api/models/user');

const s3BucketName = process.env.S3_BUCKET_NAME;
const s3BucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const newS3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: s3BucketRegion,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

const MulterUpload = upload.single('avatar');

const updateImageByKey = async (filter, update) => {
  const currentUser = await User.findOne(filter);

  const oldImageFile = currentUser?.profileImage;

  if (fs.existsSync(oldImageFile)) {
    // Delete the old image file
    fs.unlinkSync(oldImageFile);
  }

  const options = {
    new: true,
  };

  const updatedUser = await User.findOneAndUpdate(filter, update, options);

  return updatedUser;
};

const renameFile = (ogFilename, fileFormat) => {
  const timeStr = Date.now();
  return ogFilename + '_' + timeStr + '.' + fileFormat;
};

const updateUserImage = async (req, res) => {
  try {
    const { email } = req.body;
    const file = req.file;
    if (!email || !file) {
      return res
        .status(404)
        .json({ message: 'Invalid file or missing email id!' });
    }

    const fileBuffer = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = renameFile(file.originalname, 'jpeg');

    const params = {
      Bucket: s3BucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await newS3Client.send(command);

    const filter = { email: email };
    const update = { profileImage: fileName };

    const updatedUser = await updateImageByKey(filter, update);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "User doesn't exists!" });
  }
};

const deleteUserImage = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: 'Invalid user!' });
    }

    const filter = { email: email };
    const update = { profileImage: null };

    const updatedUser = await updateImageByKey(filter, update);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "User doesn't exists!" });
  }
};

const fetchUserImage = async (req, res) => {
  // fetch image
  const imageName = req.params.imageName;
  console.log('In server', imageName);
  const getObjectParams = {
    Bucket: s3BucketName,
    key: imageName,
  };
  const command = new GetObjectCommand(getObjectParams);
  const imageUrl = await getSignedUrl(newS3Client, command, {
    expiresIn: 3600,
  });
  return imageUrl;
};

module.exports = {
  MulterUpload,
  updateUserImage,
  deleteUserImage,
  fetchUserImage,
};
