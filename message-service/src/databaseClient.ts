import { MongoClient } from 'mongodb';

import env from './config';

export const databaseClient = new MongoClient(env.mongoUri);
