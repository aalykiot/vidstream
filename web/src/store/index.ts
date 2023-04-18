import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './features/token';
import playerReducer from './features/player';
import videosReducer from './features/videos';

const store = configureStore({
  reducer: {
    token: tokenReducer,
    player: playerReducer,
    videos: videosReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
