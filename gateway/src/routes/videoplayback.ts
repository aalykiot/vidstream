import { Readable } from 'stream';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3, VIDEOS_BUCKET } from '../s3/client';
import { redis } from '../redis/client';

type RequestParams = { id: string };

const prisma = new PrismaClient();

async function onVideoPlayback(request: FastifyRequest, reply: FastifyReply) {
  // Get video ID from query params.
  const { id } = request.params as RequestParams;

  if (id === '') {
    const err = new Error(`You need to provide a video ID.`);
    reply.status(400).send(err);
    return;
  }

  // Find requested video in database.
  const videoDocument = await prisma.video.findFirst({
    where: { reference: id },
  });

  if (videoDocument === null) {
    const err = new Error(`Video does not exists.`);
    reply.status(404).send(err);
    return;
  }

  const range = request.headers.range;

  if (range !== undefined) {
    // Extract start and end value from range header.
    const [startValue, endValue] = range.replace(/bytes=/, '').split('-');
    const size = videoDocument.size;

    const start = parseInt(startValue, 10);
    const end = endValue ? parseInt(endValue, 10) : size - 1;

    // Handle unavailable range request.
    if (start >= size || end >= size) {
      const err = new Error(`The range you requested is unavailable.`);
      reply.header('Content-Range', `bytes */${size}`);
      reply.status(416).send(err);
      return;
    }

    // Get requested range of the video file from the S3 bucket.
    const cmd = new GetObjectCommand({
      Bucket: VIDEOS_BUCKET,
      Key: id,
      Range: `bytes=${start}-${end}`,
    });

    const video = await s3.send(cmd);

    // Update view count in redis.
    await redis.incr(id);

    // Stream video to client.
    reply.header('Content-Range', `bytes ${start}-${end}/${size}`);
    reply.header('Accept-Ranges', 'bytes');
    reply.header('Content-Length', end - start + 1);
    reply.header('Content-Type', video.ContentType);

    return reply.send(video.Body as Readable);
  }

  // Start streaming video object from the s3 bucket.
  const cmd = new GetObjectCommand({
    Bucket: VIDEOS_BUCKET,
    Key: id,
  });

  const video = await s3.send(cmd);

  // Update view count in redis.
  await redis.incr(id);

  // Stream video file to client.
  return reply
    .header('Content-Type', video.ContentType)
    .send(video.Body as Readable);
}

export const autoPrefix = '/api/video-playback';

export default async function (fastify: FastifyInstance) {
  // Register the route to fastify.
  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: onVideoPlayback,
  });
}
