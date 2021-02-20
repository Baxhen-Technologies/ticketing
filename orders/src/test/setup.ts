import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Jwt } from '@bxtickets/common';

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(): string[];
    }
  }
}

jest.mock('../nats');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'qwqwwqwqwqw';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getCookie = () => {
  // Build a JWT payload. {id, email}
  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  //Create the JWT
  //Build session Object. {jwt: MY_JWT}
  const session = Jwt.sign(payload);
  //Turn That session into JSON
  const sessionJSON = JSON.stringify(session);
  //Take JSON and encode is as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return a string that is the cookie with cookie data
  const cookie = [`express:sess=${base64}`];

  return cookie;
};
