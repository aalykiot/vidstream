import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { WithId } from 'mongodb';
import config from '../config';
import { getDatabase } from '../db';
import { authCreateSchema, authSchema } from '../validations/admin';

// The controller for the /__admin/auth/create endpoint.
async function onAuthCreate(request: FastifyRequest, reply: FastifyReply) {
  // Validate input schema.
  const validation = authCreateSchema.safeParse(request.body);

  if (!validation.success) {
    reply.code(400).send(validation.error);
    return;
  }

  const adminCollection = getDatabase().collection('admins');

  // Check if provided name is already an admin.
  const count = await adminCollection.countDocuments({
    name: validation.data.name,
  });

  if (count !== 0) {
    reply.code(409).send(new Error('The provided name is already an admin.'));
    return;
  }

  // Hash password and insert new admin.
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(validation.data.password, salt);

  await adminCollection.insertOne({ name: validation.data.name, password });

  // Generate JWT token.
  const token = jwt.sign({ isAdmin: true }, config.jwt.secret);

  return { token };
}

type AdminDocument = {
  name: string;
  password: string;
};

// The controller for the /__admin/auth endpoint.
async function onAuth(request: FastifyRequest, reply: FastifyReply) {
  // Validate input schema.
  const validation = authSchema.safeParse(request.body);

  if (!validation.success) {
    reply.code(400).send(validation.error);
    return;
  }

  const adminCollection = getDatabase().collection('admins');

  // Check if admin exists.
  const admin = (await adminCollection.findOne({
    name: validation.data.name,
  })) as WithId<AdminDocument> | null;

  if (admin === null) {
    reply.code(401).send(new Error('Admin name or password is incorrect.'));
    return;
  }

  // Check is password is correct.
  const isPassCorrect = await bcrypt.compare(
    validation.data.password,
    admin.password
  );

  if (!isPassCorrect) {
    reply.code(401).send(new Error('Admin name or password is incorrect.'));
    return;
  }

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

  fastify.route({
    method: 'POST',
    url: '/auth',
    handler: onAuth,
  });
}
