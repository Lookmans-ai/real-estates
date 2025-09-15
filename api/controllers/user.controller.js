import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import Listing from '../models/Listing.model.js';

export const test = (req, res) => {
  res.status(200).json({ message: 'Api route is working!' });
};

// Update controller

export const updateUser = async (req, res, next) => {
  // console.log('BODY:', req.body);
  // console.log('HEARDERS:', req.headers);

  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'Not Authorized!'));

  try {
    const updateFields = {};
    if (req?.body?.username) updateFields.username = req.body.username;
    if (req?.body?.email) updateFields.email = req.body.email;
    if (req?.body?.avatar) updateFields.avatar = req.body.avatar;
    if (req?.body?.password) {
      updateFields.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: 'User updated successfully!',
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};

// Delete contoller

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account!'));
  }

  try {
    await User.findByIdAndDelete(req.params.id);

    res.clearCookie('access_token');

    res
      .status(200)
      .json({ success: true, message: 'User has been deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Listing controller

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listing!'));
  }
};
