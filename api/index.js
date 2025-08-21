import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

const port = process.env.PORT || 1024;

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
