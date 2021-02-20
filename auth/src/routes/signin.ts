import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { BadRequestError, validateRequest, Jwt } from '@bxtickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

const validateBody = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('You must supply a password'),
];

router.post(
  '/api/users/signIn',
  validateBody,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    req.session = Jwt.sign(payload);
    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
