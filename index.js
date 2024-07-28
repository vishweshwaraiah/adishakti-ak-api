const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

require('module-alias/register');
require('@api/configs/dbConfig');

const userRouter = require('@api/routes/userRoutes');
const msgRouter = require('@api/routes/msgRoutes');
const errorHandler = require('@api/_helpers/errorHandler');

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100, // 100 api calls per 10 minutes
  message: 'Too many requests, please try again after sometime!',
});

app.use(limiter);

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

  console.log('Health Check called');

  res.status(200).json({
    message: 'Application API is up and running properly!',
    health: {
      url,
      method,
    },
  });
});

// End points for user actions
app.use('/api', userRouter);

// End points for user messaging actions
app.use('/api', msgRouter);

// Define a route to render the HTML file by default
app.get('/', (req, res) => {
  res.render('index');
});

// View of all other 404 routes
app.get('/*', (req, res) => {
  res.render('error_404');
});

// global error handler
app.use(errorHandler);

const port = process.env.APP_PORT || 8000;

app.listen(port, () => {
  console.log('App server is running on port ' + port);
});
