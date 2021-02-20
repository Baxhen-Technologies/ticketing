import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { param } from 'express-validator';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@bxtickets/common';

import { Order } from '../models/order';

const router = express.Router();

const showOrderValidator = [
  param('orderId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('OrderId must be provided and valid'),
];

router.get(
  '/api/orders/:orderId',
  requireAuth,
  ...showOrderValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
