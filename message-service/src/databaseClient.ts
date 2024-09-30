import { MongoClient } from 'mongodb';

import env from './env';

export const client = new MongoClient(env.MESSAGE_SERVICE_MONGO_URI);
