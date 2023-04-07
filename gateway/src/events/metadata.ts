import _ from 'lodash';
import { ConsumeMessage } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { channel } from '../rabbitmq/client';

type Metadata = {
  reference: string;
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
  await prisma.video.update({
    where: { reference: metadata.reference },
    data: {
      step: metadata.step,
      previews: metadata.previews,
      available: true,
      thumbnail,
    },
  });

  // Acknowledge message reception.
  channel.ack(message);
}
