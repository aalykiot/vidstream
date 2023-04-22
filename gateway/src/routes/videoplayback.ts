import _ from 'lodash';
import { Readable } from 'stream';
import parseRange, { Range } from 'range-parser';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3, VIDEOS_BUCKET } from '../s3/client';

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

  const { size } = videoDocument;

  if (!videoDocument.available) {
    const err = new Error(`Video is not yet available.`);
    reply.status(404).send(err);
    return;
  }

  const defaultRange = `bytes=0-${size - 1}`;
  const range = parseRange(size, request.headers.range ?? defaultRange);

  // Handle unavailable range request.
  if (range === -1 || range === -2) {
    const err = new Error(`The range you requested is unavailable.`);
    reply.header('Content-Range', `bytes */${size}`);
    reply.status(416).send(err);
    return;
  }

  // Extract start and end value from range header.
  const { start, end } = _.first(range) as Range;

  // Get requested range of the video file from the S3 bucket.
  const cmd = new GetObjectCommand({
    Bucket: VIDEOS_BUCKET,
    Key: id,
    Range: `bytes=${start}-${end}`,
  });

  const video = await s3.send(cmd);

  // Stream video to client.
  reply.code(request.headers.range ? 206 : 200);
  reply.header('Accept-Ranges', 'bytes');
  reply.header('Content-Length', end + 1 - start);
  reply.header('Content-Range', `bytes ${start}-${end}/${size}`);
  reply.header('Content-Type', video.ContentType);

  return reply.send(video.Body as Readable);
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
