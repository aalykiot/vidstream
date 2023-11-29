import { head } from 'lodash';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3, VIDEOS_BUCKET, PREVIEWS_BUCKET } from '../s3/client';
import { channel, VIDEO_PROCESS_QUEUE } from '../rabbitmq/client';
import { redis } from '../redis/client';
import { prisma } from '../prisma/client';

async function onVideos(_request: FastifyRequest, reply: FastifyReply) {
  // Get all available videos.
  const opts = { where: { available: true } };
  const videosList = await prisma.video.findMany(opts);

  // Create a timestamp token.
  const token = new Date().getTime();

  if (videosList.length === 0) {
    reply.send({ token, videos: [] });
    return;
  }

  // Get view counts for all videos.
  const references = videosList.map(({ reference }) => reference);
  const viewCounts = await redis.mGet(references);

  // Parse the view counts from Redis, defaulting to 0 if not found.
  const views = viewCounts.map((count) => parseInt(count ?? '0', 10));

  // Map documents to JSON array.
  const videos = videosList.map((video, idx) => ({
    id: video.reference,
    title: video.title,
    duration: video.duration,
    size: video.size,
    available: video.available,
    views: views[idx],
    thumbnail: video.thumbnail,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  }));

  reply.send({ token, videos });
}

type RequestParams = { id: string };

async function onDelete(request: FastifyRequest, reply: FastifyReply) {
  // Get ID from the url.
  const { id } = request.params as RequestParams;

  // Find video in the database.
  const document = await prisma.video.findFirst({
    where: { reference: id },
  });

  if (document === null) {
    const err = new Error(`Video does not exists.`);
    reply.status(404).send(err);
    return;
  }

  const { previews } = document;

  // Remove all previews from S3.
  const purgePreviewsCommand = new DeleteObjectsCommand({
    Bucket: PREVIEWS_BUCKET,
    Delete: {
      Objects: previews.map((key: string) => ({
        Key: key,
      })),
    },
  });

  // Remove the video file from S3.
  const purgeVideoCommand = new DeleteObjectsCommand({
    Bucket: VIDEOS_BUCKET,
    Delete: {
      Objects: [{ Key: id }],
    },
  });

  await s3.send(purgePreviewsCommand);
  await s3.send(purgeVideoCommand);

  // Remove metadata from from the DBs.
  await prisma.video.delete({ where: { id: document.id } });
  await redis.del(document.id);

  reply.send({ ok: true });
}

async function onSpecificVideo(request: FastifyRequest, reply: FastifyReply) {
  // Get ID from the url.
  const { id } = request.params as RequestParams;

  // Find video in the database.
  const document = await prisma.video.findFirst({
    where: { reference: id },
  });

  if (document === null) {
    const err = new Error(`Video does not exists.`);
    reply.status(404).send(err);
    return;
  }

  // Retrieve video views from Redis.
  const viewsCount = await redis.get(document.reference);
  const views = Number.parseInt(viewsCount ?? '0', 10);

  // Map documents to JSON array.
  const video = {
    id: document.reference,
    title: document.title,
    duration: document.duration,
    size: document.size,
    available: document.available,
    views,
    previews: document.previews,
    step: document.step,
    thumbnail: document.thumbnail,
    mimetype: document.mimetype,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

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
  const title = head(data?.filename?.split('.')) || 'No title';

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
  const id = nanoid();

  // Upload video file to s3 bucket.
  const s3Upload = new Upload({
    client: s3,
    tags: [],
    queueSize: 1,
    leavePartsOnError: false,
    params: {
      Bucket: VIDEOS_BUCKET,
      Key: id,
      Body: data.file,
      ContentType: mimetype,
    },
  });

  await s3Upload.done();

  // Add video metadata information to database.
  const document = await prisma.video.create({
    data: {
      reference: id,
      title,
      size: data.file.bytesRead,
      previews: [],
      mimetype,
    },
  });

  // Publish video-process message to queue.
  const message = JSON.stringify({ reference: id, mimetype });
  channel.sendToQueue(VIDEO_PROCESS_QUEUE, Buffer.from(message));

  // Map document into a JSON object.
  const video = {
    id: document.reference,
    title: document.title,
    size: document.size,
    available: document.available,
    mimetype: document.mimetype,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  reply.send(video);
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

  // Register the '/videos/<ID>' (delete) route to fastify.
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: onDelete,
  });

  // Register the '/videos/upload' route to fastify.
  fastify.route({
    method: 'POST',
    url: '/upload',
    handler: onUpload,
  });
}
