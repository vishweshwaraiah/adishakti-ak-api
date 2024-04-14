const express = require('express');
const path = require('path');
require('module-alias/register');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');

require('@api/configs/dbConfig');

const msgRouter = require('@api/routes/msgRoutes');
const userRouter = require('@api/routes/userRoutes');

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// test if api endpoints are up and running from browsers
app.get('/up', async (req, res) => {
  res.status(200).json({ message: 'App is running properly!' });
});

// End points for user actions
app.use('/', userRouter);

// End points for user messaging actions
app.use('/', msgRouter);

// to get images
app.get('/assets/uploads/:image', (req, res) => {
  const image = req.params.image;
  res.sendFile(path.join(__dirname, './assets/uploads/' + image));
});

const port = process.env.APP_PORT || 8000;
app.listen(port, () => {
  console.log('App server is running on port ' + port);
});
