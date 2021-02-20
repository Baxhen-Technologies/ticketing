import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { createTicket } from './index.test';

it('fetches the order', async () => {
  const ticket = await createTicket();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});
it('returns 404 if the order is not found', async () => {
  const orderId = Types.ObjectId();
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(404);
});
it("returns an error if an user tries to fetch another user's order", async () => {
  const ticket = await createTicket();

  const user = global.getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});
