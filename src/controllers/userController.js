const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('@api/models/user');

const sendVerificationEmail = async (email, verificationToken) => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jk.vishwesh@gmail.com',
      pass: 'dgcb wiee ypvk qwqm',
    },
  });

  const mailOptions = {
    from: 'adishakti-kkmr.com',
    to: email,
    subject: 'Email Verification',
    text: `Please click on the following link to verify your email: https://localhost:3000/verify/${verificationToken}`,
  };

  //send the mail
  try {
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.log('Error in sending verification mail!');
  }
};

const generateSecretkey = () => {
  const secretKey = crypto.randomBytes(32).toString('hex');
  return secretKey;
};

const secretKey = generateSecretkey();

const registerUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email || !mobile || !password) {
      return res.status(400).json({ message: 'All the fields are required!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    const newUser = new User({
      email: email,
      mobile: mobile,
      password: password,
    });

    newUser.verificationToken = crypto.randomBytes(20).toString('hex');

    await newUser.save();

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    return res.status(200).json({ message: 'Registration successful!' });
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
      return res.status(404).json({ message: 'Invalid verification token!' });
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password!' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

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
    const { email } = req.params;

    if (!email) {
      return res.status(404).json({ message: 'Invalid email id!' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Invalid user email id!' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Profile doesn't exists!" });
  }
};

module.exports = {
  registerUser,
  verifyUserToken,
  userLogin,
  getUserByToken,
  getUserByEmail,
};
