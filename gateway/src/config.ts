import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    port: z.string().optional().default('8080'),
  }),
  db: z.object({
    url: z.string(),
    username: z.string(),
    password: z.string(),
    authSource: z.string(),
  }),
  s3: z.object({
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    endpoint: z.string(),
  }),
});

const config = configSchema.parse({
  app: {
    port: process.env.PORT,
  },
  db: {
    url: process.env.MONGO_URL,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    authSource: process.env.MONGO_AUTH_SOURCE,
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
  },
});

export default config;
