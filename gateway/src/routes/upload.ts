import _ from 'lodash';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { Upload } from '@aws-sdk/lib-storage';
import { s3 } from '../s3/client';

const acceptableMimeTypes = [
  'video/avi',
  'video/mpeg',
  'video/x-mpeg',
  'video/mp4',
  'video/ogg',
  'video/webm',
];

const prisma = new PrismaClient();

// The controller for the /upload endpoint.
async function onUpload(request: FastifyRequest, reply: FastifyReply) {
  // Process a single file.
  const data = await request.file();

  if (data === undefined) {
    const err = new Error(`Couldn't process the file successfully.`);
    reply.status(400).send(err);
    return;
  }

  const mimetype = data.mimetype;

  if (!acceptableMimeTypes.includes(mimetype)) {
    const err = new Error(`Provided file's mimetype is not supported.`);
    reply.status(400).send(err);
    return;
  }

  // Create a unique reference for the video.
  const id = `vid_${nanoid()}`;

  // Upload video file to s3 bucket.
  const s3Upload = new Upload({
    client: s3,
    tags: [],
    queueSize: 1,
    leavePartsOnError: false,
    params: {
      Bucket: 'videos',
      Key: id,
      Body: data.file,
      ContentType: mimetype,
    },
  });

  await s3Upload.done();

  // Add video metadata information to database.
  const videoDocument = await prisma.video.create({
    data: {
      reference: id,
      size: data.file.bytesRead,
      previews: [],
      mimetype,
    },
  });

  // Remove DB's `id` field and replace it with the `reference` field.
  const videoMetadata = _.mapKeys(_.omit(videoDocument, ['id']), (_val, key) =>
    key === 'reference' ? 'id' : key
  );

  reply.send(videoMetadata);
}

export const autoPrefix = '/upload';

export default async function (fastify: FastifyInstance) {
  // Register the route to fastify.
  fastify.route({
    method: 'POST',
    url: '/',
    handler: onUpload,
  });
}
