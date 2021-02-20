import request from 'supertest';
import { Types } from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';

import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'qwertyu',
      orderId: Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it('returns 401 when purchasing an order that do not belongs to the user', async () => {
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId: Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'qwertyu',
      orderId: order.id,
    })
    .expect(401);
});
it('returns 400 when purchasing a cancelled order', async () => {
  const userId = Types.ObjectId().toHexString();

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.CancelledByExpiration,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'qwertyu',
      orderId: order.id,
    })
    .expect(400);
});
it('returns a 201 with valid inputs', async () => {
  const userId = Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const { data } = await stripe.charges.list({ limit: 50 });

  const stripeCharge = data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');
});
it('returns a 400 with invalid token', async () => {
  const userId = Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'tok_visaa',
      orderId: order.id,
    })
    .expect(400);
});
it('returns a 201 with valid inputs', async () => {
  const userId = Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const { data } = await stripe.charges.list({ limit: 50 });

  const stripeCharge = data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
