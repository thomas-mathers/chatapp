import { faker } from '@faker-js/faker';
import { TestContext, afterEach, beforeEach } from 'vitest';

import { App } from './app';
import { getConfig } from './config';

const config = getConfig();

beforeEach(async (context: TestContext) => {
  context.app = await App.launch({
    ...config,
    mongo: {
      ...config.mongo,
      databaseName: generateTestDatabaseName(),
    },
  });
});

afterEach(async ({ app }) => {
  await app.mongoDatabase.dropDatabase();
  await app.close();
});

function generateTestDatabaseName(): string {
  return `test_db_${faker.string.uuid()}`;
}
