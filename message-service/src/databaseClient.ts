import { MongoClient } from 'mongodb';

import env from './env';

export const databaseClient = new MongoClient(env.MONGO_URI);
