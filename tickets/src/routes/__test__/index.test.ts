import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title,
      price,
    })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  const ticketsList = [
    { title: 'Concert', price: 10 },
    { title: 'Movie', price: 5 },
    { title: 'Armstrong Show', price: 50 },
  ];

  for (const { title, price } of ticketsList) {
    await createTicket(title, price);
  }

  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.length).toEqual(3);
});
