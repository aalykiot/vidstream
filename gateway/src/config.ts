import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    port: z.string().optional().default('8080'),
  }),
  db: z.object({
    url: z.string(),
  }),
  aws: z.object({
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
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
  },
  amqp: {
    url: process.env.AMQP_URL,
  },
});

export default config;
