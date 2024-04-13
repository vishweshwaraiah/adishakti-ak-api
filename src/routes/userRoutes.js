const express = require('express');
const MulterUpload = require('@api/configs/multer');

const {
  registerUser,
  verifyUserToken,
  userLogin,
  getUserByToken,
  getUserByEmail,
  updateUserImage,
  deleteUserImage,
} = require('@api/controllers/userController');

const userRouter = express.Router();

userRouter.post('/register', registerUser);

userRouter.get('/verify/:token', verifyUserToken);

userRouter.post('/login', userLogin);

userRouter.get('/get_user/:token', getUserByToken);

userRouter.get('/fetch_user/:email', getUserByEmail);

userRouter.put('/upload_image/', MulterUpload, updateUserImage);

userRouter.put('/delete_image', deleteUserImage);

module.exports = userRouter;
