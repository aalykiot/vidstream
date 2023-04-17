import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './tokenSlice';
import videosReducer from './videosSlice';

const store = configureStore({
  reducer: {
    token: tokenReducer,
    videos: videosReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
