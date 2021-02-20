import request from 'supertest';
import { app } from '../../app';

it('clears cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signOut')
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')[0].split(';')[0].split('sess=')[1]).toEqual(
    ''
  );
});
