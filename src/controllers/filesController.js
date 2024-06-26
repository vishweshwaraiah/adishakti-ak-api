const fs = require('fs');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const sharp = require('sharp');
const User = require('@api/models/userModel');

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
    const { userEmail, currentImage } = req.body;

    const file = req.file;

    if (!userEmail || !file) {
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

    let fileName = currentImage;

    // replace if there is already an image available
    if (currentImage === 'null') {
      fileName = renameFile(file.originalname, 'jpeg');
    }

    const params = {
      Bucket: s3BucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await newS3Client.send(command);

    const filter = { userEmail: userEmail };
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
    const { userEmail, profileImage } = req.body;

    if (!userEmail || !profileImage) {
      return res
        .status(404)
        .json({ message: 'Email or Image name is invalid!' });
    }

    const getObjectParams = {
      Bucket: s3BucketName,
      Key: profileImage,
    };

    const command = new DeleteObjectCommand(getObjectParams);
    await newS3Client.send(command);

    const filter = { userEmail: userEmail };
    const update = { profileImage: null };

    const updatedUser = await updateImageByKey(filter, update);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "User doesn't exists!" });
  }
};

const fetchUserImage = async (req, res) => {
  try {
    // fetch image
    const imageName = req.params.imageName;

    if (imageName === null || imageName === '') {
      return res
        .status(404)
        .json({ message: 'Image name parameter is null or empty!' });
    }

    const getObjectParams = {
      Bucket: s3BucketName,
      Key: imageName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const imageUrl = await getSignedUrl(newS3Client, command);
    return res.status(200).json(imageUrl);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Image doesn't exists!" });
  }
};

module.exports = {
  MulterUpload,
  updateUserImage,
  deleteUserImage,
  fetchUserImage,
};
