import _ from 'lodash';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
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

  // Convert the video documents into a JSON array.
  const videos = videosList.map((document) =>
    _.mapKeys(_.omit(document, ['id']), (_val, key) =>
      key === 'reference' ? 'id' : key
    )
  );

  // Send the video list to the client.
  connection.socket.send(videos);
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

  // Sends a message to all connected WebSocket clients.
  function broadcast(message: unknown) {
    for (const client of fastify.websocketServer.clients) {
      client.send(JSON.stringify(message));
    }
  }

  // Register the 'broadcast' function as an event listener for
  // the 'broadcast' event on the event bus.
  eventBus.on('broadcast', broadcast);
}
