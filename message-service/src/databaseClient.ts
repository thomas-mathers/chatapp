import { MongoClient } from 'mongodb';

import config from './config';

export const databaseClient = new MongoClient(config.mongoUri);
