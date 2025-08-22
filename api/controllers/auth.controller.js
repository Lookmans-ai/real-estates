import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res, next) => {
  //   console.log(req.body);
  const { username, email, password } = req.body;

  //   console.log({ username, email, password });

  if (!username || !email || !password) {
    // return res.status(400).json({ message: 'Please fill all input!' });
    return next(errorHandler(400, 'Please fill in all input!'));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, 'User already exists!'));
    }

    // Hash the password
    const hashPassword = bcryptjs.hashSync(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      next(errorHandler(400, 'Wrong credentials!'));
    } else {
      next(error);
    }
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // return res.status(400).json({ message: 'Please fill all input!' });
    return next(errorHandler(400, 'Please fill in all input!'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json({ ...rest, message: 'Sign in successful!' });
  } catch (error) {
    if (error.code === 11000) {
      next(errorHandler(400, 'Wrong credentials!'));
    } else {
      next(error);
    }
  }
};
