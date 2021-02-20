import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { User } from '../models/user';
import { BadRequestError, Jwt, validateRequest } from '@bxtickets/common';

const router = express.Router();

const validateBody = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters'),
];

router.post(
  '/api/users/signUp',
  validateBody,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password });
    await user.save();
    const payload = {
      id: user.id,
      email: user.email,
    };

    req.session = Jwt.sign(payload);

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
