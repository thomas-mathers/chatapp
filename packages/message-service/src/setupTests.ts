import { faker } from '@faker-js/faker';
import { createJwt } from 'chatapp.crypto';
import { TestContext, afterEach, beforeEach } from 'vitest';

import { run } from './app';
import { setupServices } from './setupServices';

beforeEach(async (context: TestContext) => {
  const services = await setupServices();

  context.credentials = {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
  };

  context.token = createJwt(context.credentials, services.config.jwt);

  context.mongoClient = services.mongoClient;
  context.mongoSession = context.mongoClient.startSession();
  context.mongoSession.startTransaction();

  context.app = run(services);
});

afterEach(async ({ mongoClient, mongoSession }: TestContext) => {
  await mongoSession.abortTransaction();
  mongoSession.endSession();
  await mongoClient.close();
});
