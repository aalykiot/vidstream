import amqplib, { Connection, Channel } from 'amqplib';
import config from '../config';

const VIDEO_PROCESS_QUEUE = 'video-process-queue';

let connection: Connection;
let channel: Channel;

async function connect() {
  // Connect to message broker.
  connection = await amqplib.connect(config.queue.url);
  channel = await connection.createChannel();

  // Make sure the queue exists.
  await channel.assertQueue(VIDEO_PROCESS_QUEUE);
}

export { channel, connect, VIDEO_PROCESS_QUEUE };
