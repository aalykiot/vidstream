import amqplib, { Connection, Channel } from 'amqplib';
import config from '../config';
import { wait } from '../utils/time';

const VIDEO_PROCESS_QUEUE = 'video-process-queue';
const VIDEO_METADATA_QUEUE = 'video-metadata-queue';

let connection: Connection;
let channel: Channel;

// Connect to the message broker using an exponential back-off strategy.
async function connectWithRetries(backoff = 1) {
  try {
    connection = await amqplib.connect(config.amqp.url);
  } catch (e) {
    // Connect has failed too many times, accept defeat.
    if (backoff > 64) throw e;

    // Back off and retry connecting a bit later.
    await wait(1000 * backoff);
    await connectWithRetries(backoff * 2);
  }
}

async function connect() {
  // Try connect to message broker.
  await connectWithRetries();
  channel = await connection.createChannel();

  // Make sure the queue exists.
  await channel.assertQueue(VIDEO_PROCESS_QUEUE);
}

export { channel, connect, VIDEO_PROCESS_QUEUE, VIDEO_METADATA_QUEUE };
