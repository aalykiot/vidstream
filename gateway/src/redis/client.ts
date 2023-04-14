import { createClient } from 'redis';
import { wait } from '../utils/time';
import config from '../config';

const { host, port, password } = config.redis;

const redis = createClient({
  socket: {
    host,
    port: Number.parseInt(port),
  },
  password,
});

// Connect to redis using an exponential back-off strategy.
async function connect(backoff = 1) {
  // Try connect to message broker.
  try {
    await redis.connect();
  } catch (e) {
    // Connect has failed too many times, accept defeat.
    if (backoff > 64) throw e;

    // Back off and retry connecting a bit later.
    await wait(1000 * backoff);
    await connect(backoff * 2);
  }
}

export { connect, redis };
