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
  const videoDocument = await prisma.video.update({
    where: { reference: metadata.reference },
    data: {
      available: true,
      duration: metadata.duration,
      step: metadata.step,
      previews: metadata.previews,
      thumbnail,
    },
  });

  const video = _.mapKeys(_.omit(videoDocument, ['id']), (_val, key) =>
    key === 'reference' ? 'id' : key
  );

  // Notify connected clients.
  eventBus.emit('broadcast', video);

  // Acknowledge message reception.
  channel.ack(message);
}
