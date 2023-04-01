import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    port: z.string().optional().default('8080'),
  }),
  db: z.object({
    url: z.string(),
  }),
  s3: z.object({
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    endpoint: z.string(),
  }),
  amqp: z.object({
    url: z.string(),
  }),
});

const config = configSchema.parse({
  app: {
    port: process.env.PORT,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
  },
  amqp: {
    url: process.env.AMQP_URL,
  },
});

export default config;
