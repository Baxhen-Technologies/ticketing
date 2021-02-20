import { OrderStatus } from '@bxtickets/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats';
import { createTicket } from './index.test';

it('marks an order as cancelled', async () => {
  const ticket = await createTicket();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(order.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.CancelledByUser);
});

it('returns 404 if the order is not found', async () => {
  const orderId = Types.ObjectId();
  await request(app)
    .patch(`/api/orders/${orderId}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(404);
});

it("returns an error if an user tries to cancel another user's order", async () => {
  const ticket = await createTicket();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});

it('emits an order cancelled event', async () => {
  const ticket = await createTicket();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
