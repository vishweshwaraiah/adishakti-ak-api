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

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Directory where your HTML files (views) are located
app.set('views', path.join(__dirname, 'views'));

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
app.get('/health', async (req, res) => {
  const { url, method } = req || {};

  res.status(200).json({
    message: 'Application API is up and running properly!',
    health: {
      url,
      method,
    },
  });
});

// End points for user actions
app.use('/', userRouter);

// End points for user messaging actions
app.use('/', msgRouter);

// Define a route to render the HTML file by default
app.get('/*', (req, res) => {
  res.render('index');
});

const port = process.env.APP_PORT || 8000;
app.listen(port, () => {
  console.log('App server is running on port ' + port);
});
