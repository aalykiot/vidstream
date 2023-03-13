import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import config from '../config';
import { getDatabase } from '../db';

const authCreateSchema = z.object({
  name: z.string().min(3).max(15),
  password: z.string().min(8),
});

// The controller for the /__admin/auth/create endpoint.
async function onAuthCreate(request: FastifyRequest, reply: FastifyReply) {
  // Validate input schema.
  const validation = authCreateSchema.safeParse(request.body);

  if (!validation.success) {
    reply.code(400).send(validation.error);
    return;
  }

  const usersCollection = getDatabase().collection('users');

  // Check if provided name is already an admin.
  const docCount = await usersCollection.countDocuments({
    name: validation.data.name,
  });

  if (docCount !== 0) {
    reply.code(409).send(new Error('The provided name is already an admin.'));
    return;
  }

  // Hash password and insert new admin.
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(validation.data.password, salt);

  await usersCollection.insertOne({ name: validation.data.name, password });

  // Generate JWT token.
  const token = jwt.sign({ isAdmin: true }, config.jwt.secret);

  return { token };
}

export const autoPrefix = '/__admin';

export default async function (fastify: FastifyInstance) {
  // Register the route to fastify.
  fastify.route({
    method: 'POST',
    url: '/auth/create',
    handler: onAuthCreate,
  });
}
