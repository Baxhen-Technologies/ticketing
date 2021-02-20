import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats';

it('has a route handler listen to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('returns other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('return an error if an invalid ticketId is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      ticketId: '',
    })
    .expect(400);
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({})
    .expect(400);
});

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      ticketId,
    })
    .expect(404);
});
it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'qwer',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});
it('reserves a ticket', async () => {
  let ordersList = await Order.find({});

  expect(ordersList.length).toEqual(0);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  ordersList = await Order.find({});

  expect(ordersList.length).toEqual(1);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
