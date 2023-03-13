import { z } from 'zod';

export const authCreateSchema = z.object({
  name: z.string().min(3).max(15),
  password: z.string().min(8),
});

export const authSchema = z.object({
  name: z.string(),
  password: z.string(),
});
