const express = require('express');

const {
  MulterUpload,
  updateUserImage,
  deleteUserImage,
  fetchUserImage,
} = require('@api/controllers/filesController');

const {
  registerUser,
  verifyUserToken,
  userLogin,
  getUserByToken,
  getUserByEmail,
} = require('@api/controllers/userController');

const userRouter = express.Router();

userRouter.post('/register', registerUser);

userRouter.get('/verify/:token', verifyUserToken);

userRouter.post('/login', userLogin);

userRouter.get('/get_user/:token', getUserByToken);

userRouter.get('/fetch_user/:email', getUserByEmail);

userRouter.put('/upload_image', MulterUpload, updateUserImage);

userRouter.get('/fetch_image/:imageName', fetchUserImage);

userRouter.put('/delete_image', deleteUserImage);

module.exports = userRouter;
