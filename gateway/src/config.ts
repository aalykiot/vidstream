import { z } from 'zod';

const configSchema = z.object({
  db: z.object({
    url: z.string(),
    username: z.string(),
    password: z.string(),
    authSource: z.string(),
  }),
  jwt: z.object({
    secret: z.string(),
  }),
});

const config = configSchema.parse({
  db: {
    url: process.env.MONGO_URL,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    authSource: process.env.MONGO_AUTH_SOURCE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});

export default config;
