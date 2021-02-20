import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { param } from 'express-validator';

import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@bxtickets/common';
import { Order, OrderStatus } from '../models/order';
import { natsWrapper } from '../nats';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();
const validator = [
  param('orderId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('OrderId must be provided and valid'),
];
router.patch(
  '/api/orders/:orderId',
  ...validator,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.CancelledByUser;

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      version: order.version,
      id: order.id,
      ticket: { id: order.ticket.id },
    });

    res.status(204).send(order);
  }
);

export { router as cancelOrderRouter };
