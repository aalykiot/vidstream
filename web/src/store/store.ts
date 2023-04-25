import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './features/token';
import playerReducer from './features/player';
import videosReducer from './features/videos';
import socketReducer from './features/socket';
import uploadReducer from './features/upload';
import socket from './middleware/socket';

const store = configureStore({
  reducer: {
    token: tokenReducer,
    socket: socketReducer,
    upload: uploadReducer,
    player: playerReducer,
    videos: videosReducer,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(socket);
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
