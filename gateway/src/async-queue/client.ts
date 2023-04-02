import amqplib, { Connection, Channel } from 'amqplib';
import config from '../config';

const VIDEO_PROCESS_QUEUE = 'video-process-queue';

let connection: Connection;
let channel: Channel;

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

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

export { channel, connect, VIDEO_PROCESS_QUEUE };
