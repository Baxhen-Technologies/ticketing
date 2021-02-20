import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@bxtickets/common';

import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-event';
import { natsWrapper } from '../nats';

const router = express.Router();

const validator = [
  body('token').not().isEmpty().withMessage('token is required'),
  body('orderId')
    .not()
    .isEmpty()
    .withMessage('orderId is required')
    .custom((input) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('order must be a valid mongo id'),
];

router.post(
  '/api/payments',
  requireAuth,
  ...validator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (
      order.status === OrderStatus.CancelledByExpiration ||
      order.status === OrderStatus.CancelledByUser ||
      order.status === OrderStatus.CancelledTicketAlreadyReserved
    ) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    try {
      const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token,
        description: 'Ticket bought on ticketing app',
      });

      const payment = Payment.build({
        orderId,
        stripeId: charge.id,
      });

      await payment.save();

      await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
      });

      res.status(201).send({ id: payment.id });
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
);

export { router as createChargeRouter };
