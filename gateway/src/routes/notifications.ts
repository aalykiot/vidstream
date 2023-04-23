import { FastifyInstance, FastifyRequest } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import { redis } from '../redis/client';
import { eventBus } from '../app';

type QueryParams = { token: string };

const prisma = new PrismaClient();

async function onNotifications(connection: SocketStream, req: FastifyRequest) {
  // Extract the timestamp from the query parameter 'token'.
  const { token } = req.query as QueryParams;

  // Get the actual timestamp from the token.
  const tokenValue = Number.parseInt(token);
  const timestamp = tokenValue ? new Date(tokenValue) : new Date();

  // Retrieve the list of video documents updated since the provided timestamp.
  const videosList = await prisma.video.findMany({
    where: { updatedAt: { gt: timestamp } },
  });

  // If there are no new video documents, there is no need to send an update.
  if (videosList.length === 0) {
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
    previews: video.previews,
    step: video.step,
    thumbnail: video.thumbnail,
    mimetype: video.mimetype,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  }));

  // Send the video list to the client.
  connection.socket.send(
    JSON.stringify({
      type: 'event/batch-video-update',
      payload: videos,
    })
  );
}

export const autoPrefix = '/notifications';

export default async function (fastify: FastifyInstance) {
  // Register the '/notifications' route to fastify.
  fastify.route({
    method: 'GET',
    url: '/',
    handler: () => {},
    wsHandler: onNotifications,
  });

  function broadcast(message: unknown) {
    // Socket only accepts strings or buffers.
    const data = JSON.stringify({
      type: 'event/single-video-update',
      payload: message,
    });

    // Sends a message to all connected WebSocket clients.
    for (const client of fastify.websocketServer.clients) {
      client.send(data);
    }
  }

  // Register the 'broadcast' function as an event listener for
  // the 'broadcast' event on the event bus.
  eventBus.on('broadcast', broadcast);
}
