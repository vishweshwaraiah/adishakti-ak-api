const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('@api/models/userModel');
const secretKey = require('@api/configs/secretKey.json');
const { MailHtml } = require('@api/configs/mailHtml');

const sendVerificationEmail = async (userEmail, verificationToken) => {
  const transport = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  const verifyLink = `http://13.126.248.37/api/verify/${verificationToken}`;

  const mailOptions = {
    from: 'adishakti-kkmr.com',
    to: userEmail,
    subject: 'Email Verification',
    html: MailHtml(verifyLink),
  };

  //send the mail
  try {
    const res = await transport.sendMail(mailOptions);
    return res;
  } catch (error) {
    console.log(error);
    return 'Error in sending verification mail!';
  }
};

const mailSender = async (req, res) => {
  const userEmail = req.params.userEmail;
  const verificationToken = crypto.randomBytes(20).toString('hex');

  const result = await sendVerificationEmail(userEmail, verificationToken);

  console.log('result', result);

  return res.status(200).json({
    message: 'Email sent successfully!',
  });
};

const registerUser = async (req, res) => {
  try {
    const { userEmail, userMobile, userPassword } = req.body;

    if (!userEmail || !userMobile || !userPassword) {
      return res.status(400).json({ message: 'All the fields are required!' });
    }

    const existingUser = await User.findOne({ userEmail: userEmail });

    if (existingUser && existingUser.userEmail) {
      return res
        .status(400)
        .json({ message: 'Email already registered! Please login.' });
    } else {
      const newUser = new User({
        userEmail: userEmail,
        userMobile: userMobile,
        userPassword: userPassword,
      });

      newUser.verificationToken = crypto.randomBytes(20).toString('hex');

      const createdUser = await newUser.save();

      await sendVerificationEmail(
        createdUser.userEmail,
        createdUser.verificationToken
      );

      return res.status(200).json({
        message: 'Registration successful!',
        userEmail: createdUser.userEmail,
      });
    }
  } catch (error) {
    console.log('Error while user registration!', error.message);
    return res.status(500).json({ message: 'Registration failed!' });
  }
};

const verifyUserToken = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Invalid verification token, or may be expired!' });
    }
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    return res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({ message: 'Email verification failed!' });
  }
};

const userLogin = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    const user = await User.findOne({ userEmail: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password!' });
    }

    if (user.userPassword !== userPassword) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    if (user.verified === false && user.verificationToken !== undefined) {
      return res.status(401).json({
        message:
          'This Email-id is not verified yet! Please check your inbox for verification instructions!',
      });
    }

    const token = jwt.sign({ userId: user._id }, secretKey.secret);

    return res.status(200).json({ token });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Login failed!' });
  }
};

const getUserByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token === null) {
      return res.status(404).json({ message: 'Invalid token!' });
    }

    const decoded = jwt.decode(token);

    const user = await User.findOne({
      _id: decoded.userId,
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid user id!' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Profile doesn't exists!" });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(404).json({ message: 'Invalid email id!' });
    }

    const user = await User.findOne({ userEmail: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'Invalid user email id!' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Profile doesn't exists!" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { userEmail, userName, userGender, userDob, userMobile } = req.body;

    if (!userEmail) {
      return res.status(404).json({ message: 'Invalid or missing email id!' });
    }

    const filter = { userEmail: userEmail };
    const update = {
      userName: userName,
      userEmail: userEmail,
      userMobile: userMobile,
      userGender: userGender,
      userDob: userDob,
    };

    const updatedUser = await updateImageByKey(filter, update);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "User doesn't exists!" });
  }
};

const onlyAdmin = async (req, res) => {
  return res.status(200).json({
    message: 'This route is accessible only to Admins!',
  });
};

module.exports = {
  registerUser,
  verifyUserToken,
  userLogin,
  getUserByToken,
  getUserByEmail,
  mailSender,
  updateUserDetails,
  onlyAdmin,
};
