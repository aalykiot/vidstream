import { channel, VIDEO_METADATA_QUEUE } from '../rabbitmq/client';
import { handleEvent } from './metadata';

// Subscribes for desired events.
export function subscribe() {
  channel.consume(VIDEO_METADATA_QUEUE, handleEvent);
}
