import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful sign up', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'asdqweads21',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: '1',
    })
    .expect(400);
});

it('returns a 400 when missing password and/or email', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signUp')
    .send({
      password: 'password',
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  expect(
    response.get('Set-Cookie')[0].split(';')[0].split('sess=')[1]
  ).toBeDefined();
});
