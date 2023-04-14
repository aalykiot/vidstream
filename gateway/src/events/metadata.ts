import _ from 'lodash';
import { ConsumeMessage } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { channel } from '../rabbitmq/client';
import { eventBus } from '../app';

type Metadata = {
  reference: string;
  duration: number;
  step: number;
  previews: string[];
};

const prisma = new PrismaClient();

// This function handles metadata messages from the broker.
export async function handleEvent(message: ConsumeMessage | null) {
  // Do not handle null messages.
  if (message === null) return;

  // Parse message data as a JSON object.
  const data = message.content.toString();
  const metadata = JSON.parse(data) as Metadata;

  // Select a random thumbnail from the available previews.
  const index = _.random(0, metadata.previews.length - 1);
  const thumbnail = metadata.previews[index];

  // Update the metadata database (MongoDB) with the received data.
  const document = await prisma.video.update({
    where: { reference: metadata.reference },
    data: {
      available: true,
      duration: metadata.duration,
      step: metadata.step,
      previews: metadata.previews,
      thumbnail,
    },
  });

  // Map document into a JSON object.
  const video = {
    id: document.reference,
    title: document.title,
    duration: document.duration,
    size: document.size,
    available: document.available,
    views: 0,
    previews: document.previews,
    step: document.step,
    thumbnail: document.thumbnail,
    mimetype: document.mimetype,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  // Notify connected clients about the video.
  eventBus.emit('broadcast', video);

  // Acknowledge message reception.
  channel.ack(message);
}
