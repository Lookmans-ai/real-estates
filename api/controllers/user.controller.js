import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';

export const test = (req, res) => {
  res.status(200).json({ message: 'Api route is working!' });
};

export const updateUser = async (req, res, next) => {
  // console.log('BODY:', req.body);
  // console.log('HEARDERS:', req.headers);

  if (req.user.id !== req.params.id)
    return next(
      errorHandler(
        401,
        'Not Authorized,  You can only update your own account!'
      )
    );

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

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }

  // try {
  //   if (req?.body?.password) {
  //     req.body.password = bcryptjs.hashSync(req?.body?.password, 10);
  //   }

  //   const updatedUser = await User.findByIdAndUpdate(
  //     req.params.id,
  //     {
  //       $set: {
  //         // ...req.body,
  //         username: req.body.username,
  //         email: req.body.email,
  //         password: req.body.password,
  //         avatar: req.body.avatar,
  //       },
  //     },
  //     { new: true }
  //   );

  //   const { password, ...rest } = updatedUser._doc;

  //   res.status(200).json(rest);
  // } catch (error) {
  //   next(error);
  // }
};
