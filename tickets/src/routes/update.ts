import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@bxtickets/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats';

const router = express.Router();

const validator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price')
    .notEmpty()
    .isFloat({ gt: 0 })
    .withMessage('Price is required and must be greater than 0'),
];
router.put(
  '/api/tickets/:id',
  ...validator,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { price, title } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) throw new NotFoundError();

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    ticket.set({
      price,
      title,
    });

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
