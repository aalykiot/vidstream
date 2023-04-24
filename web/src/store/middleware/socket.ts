import { Middleware, Dispatch, AnyAction } from '@reduxjs/toolkit';
import Socket from '../../utils/socket';
import type { RootState } from '../store';
import { connect, connected } from '../features/socket';
import { singleUpdate, batchUpdate, countView } from '../features/videos';

const socketUri = 'ws://localhost:8080/notifications';
const socket = new Socket();

// Structure of the server event.
type Event<T> = {
  type: string;
  payload?: T;
};

const handleIncoming =
  (dispatch: Dispatch<AnyAction>) => (message: MessageEvent<string>) => {
    // Parse server event into a JS object.
    const event = JSON.parse(message.data) as Event<unknown>;
    const { type, payload } = event;

    switch (type) {
      case 'event/single-video-update':
        dispatch(singleUpdate(payload));
        break;
      case 'event/batch-video-update':
        dispatch(batchUpdate(payload));
        break;
      default:
        break;
    }
  };

const socketMiddleware: Middleware = (storeApi) => (next) => (action) => {
  // Extract necessary utilities.
  const { dispatch, getState } = storeApi;
  const { type } = action;
  const state = getState() as RootState;

  switch (type) {
    case connect.type:
      socket.connect(`${socketUri}/?token=${state.token}`);
      socket.on('open', () => dispatch(connected()));
      socket.on('message', handleIncoming(dispatch));
      break;
    case countView.type:
      socket.send({
        type: 'event/increment-view-count',
        payload: action.payload,
      });
      break;
    default:
      break;
  }

  return next(action);
};

export default socketMiddleware;
