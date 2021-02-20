import request from 'supertest';
import { app } from '../../app';

it('fails when an email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when an incorrect password are supplied', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'sadweadasd',
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});

it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'asdqweads21',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
      password: '1',
    })
    .expect(400);
});

it('returns a 400 when missing password and/or email', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signIn')
    .send({
      password: 'password',
    })
    .expect(400);
});
