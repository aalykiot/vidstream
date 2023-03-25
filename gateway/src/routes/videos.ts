import _ from 'lodash';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { Upload } from '@aws-sdk/lib-storage';
import { s3 } from '../s3/client';

const prisma = new PrismaClient();

async function onVideos(_request: FastifyRequest, reply: FastifyReply) {
  // Get all available videos.
  const videosList = await prisma.video.findMany({ where: { active: true } });

  // Map documents to JSON array.
  const videos = videosList.map((document) =>
    _.mapKeys(_.omit(document, ['id']), (_val, key) =>
      key === 'reference' ? 'id' : key
    )
  );

  reply.send(videos);
}

type RequestParams = { id: string };

async function onSpecificVideo(request: FastifyRequest, reply: FastifyReply) {
  // Get ID from the url.
  const { id } = request.params as RequestParams;

  // Find video in the database.
  const videoDocument = await prisma.video.findFirst({
    where: { reference: id },
  });

  if (videoDocument === null) {
    const err = new Error(`Video does not exists.`);
    reply.status(404).send(err);
    return;
  }

  // Map to JSON object.
  const video = _.mapKeys(_.omit(videoDocument, ['id']), (_val, key) =>
    key === 'reference' ? 'id' : key
  );

  reply.send(video);
}

const acceptableMimeTypes = [
  'video/avi',
  'video/mpeg',
  'video/x-mpeg',
  'video/mp4',
  'video/ogg',
  'video/webm',
];

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

export const autoPrefix = '/api/videos';

export default async function (fastify: FastifyInstance) {
  // Register the '/videos' route to fastify.
  fastify.route({
    method: 'GET',
    url: '/',
    handler: onVideos,
  });

  // Register the '/videos/<ID>' route to fastify.
  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: onSpecificVideo,
  });

  // Register the '/videos/upload' route to fastify.
  fastify.route({
    method: 'POST',
    url: '/upload',
    handler: onUpload,
  });
}
