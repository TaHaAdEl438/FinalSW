// this you need t o import
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const dbConnection = require('./config/database');
const globalError = require('./middlewares/errorMiddleware');

const categoryRoute = require('./routes/categoryRoute');
const authRoute = require('./routes/authRoute');
// connect with db
dbConnection();

// express app
const app = express();

//Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_env}`);
}
// Mount Routes

app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/auth', authRoute);

app.all('*', (req, res, next) => {
  next(new ApiError(`Cant fing this route : ${req.originalUrl}`, 400));
});

// global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
//Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
