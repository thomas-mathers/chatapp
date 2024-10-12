import { faker } from '@faker-js/faker';
import { createJwt } from 'chatapp.crypto';
import { TestContext, afterEach, beforeEach } from 'vitest';

import { App } from './app';
import { getConfig } from './config';

const config = getConfig();

beforeEach(async (context: TestContext) => {
  context.token = createJwt(
    {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
    },
    config.jwt,
  );

  context.app = await App.launch({
    ...config,
    mongo: {
      ...config.mongo,
      databaseName: generateTestDatabaseName(),
    },
  });
});

afterEach(async ({ app }) => {
  await app.dropDatabase();
  await app.close();
});

function generateTestDatabaseName(): string {
  return `test_db_${faker.string.uuid()}`;
}
