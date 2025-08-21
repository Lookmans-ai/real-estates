import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';

dotenv.config();

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log(`Connected to MongoDB!`);
  })
  .catch((err) => {
    console.error('Error in Connecting to MongoDb', err.message);
  });

const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

// app.use((err, req, res, next) => {
//   res.status(500).json({ err: err.message });
// });

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const port = process.env.PORT || 1024;

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
