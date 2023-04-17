import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './slices/token';
import playerReducer from './slices/player';
import videosReducer from './slices/videos';

const store = configureStore({
  reducer: {
    token: tokenReducer,
    player: playerReducer,
    videos: videosReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
