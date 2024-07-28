const express = require('express');
const authorize = require('@api/_helpers/authorize');
const Roles = require('@api/_helpers/roles');

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
  mailSender,
  updateUserDetails,
  onlyAdmin,
} = require('@api/controllers/userController');

const {
  updateSettings,
  fetchSettings,
} = require('@api/controllers/settingsController');

const userRouter = express.Router();

userRouter.post('/register', registerUser);

userRouter.get('/verify/:token', verifyUserToken);

userRouter.post('/login', userLogin);

userRouter.put('/upload_image', MulterUpload, updateUserImage);

userRouter.get('/get_user', authorize(), getUserByToken);

userRouter.get('/fetch_user/:userEmail', authorize(), getUserByEmail);

userRouter.get('/fetch_image/:imageName', authorize(), fetchUserImage);

userRouter.put('/delete_image', authorize(), deleteUserImage);

userRouter.get('/send_mail/:userEmail', authorize(), mailSender);

userRouter.put('/update_user', authorize(), updateUserDetails);

userRouter.get('/admin_only', authorize(Roles.Admin), onlyAdmin);

userRouter.put('/update_settings', authorize(), updateSettings);

userRouter.get('/fetch_settings/:userEmail', authorize(), fetchSettings);

module.exports = userRouter;
