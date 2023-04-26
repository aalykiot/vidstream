import { uniqBy } from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setToken } from './token';
import { connect } from './socket';
import type { RootState } from '../store';

type Video = {
  id: string;
  title: string;
  duration: number;
  size: number;
  available: boolean;
  views: number;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

type APIResponse = {
  token: string;
  videos: Video[];
};

export const BASE_URL = 'http://localhost:8080/api';

/* ASYNC THUNKS */

export const fetchVideosAsync = createAsyncThunk(
  'videos/fetchVideos',
  async (__, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const response = await fetch(`${BASE_URL}/videos`);
    const { token, videos } = (await response.json()) as APIResponse;
    thunkAPI.dispatch(setToken(token));
    if (!state.socket) thunkAPI.dispatch(connect());
    return videos;
  }
);

export const removeVideoAsync = createAsyncThunk(
  'videos/removeVideo',
  async (videoId: string) => {
    await fetch(`${BASE_URL}/videos/${videoId}`, { method: 'DELETE' });
    return videoId;
  }
);

/* STATE */

type InitState = {
  value: Video[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState = { value: [], status: 'idle', error: null } as InitState;

/* REDUCERS */

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    singleUpdate: (state, action) => {
      // Create full URLs when necessary.
      const video = action.payload as Video;
      video.thumbnail = `${BASE_URL}/previews/${video.thumbnail}`;

      // Do not insert if it's duplicate.
      if (!state.value.find(({ id }) => id === video.id)) {
        state.value.unshift(video);
      }
    },
    batchUpdate: (state, action) => {
      // Create full URLs when necessary.
      const videos = action.payload as Video[];
      const entities = videos
        .map((video) => ({
          ...video,
          thumbnail: `${BASE_URL}/previews/${video.thumbnail}`,
        }))
        .reverse();

      state.value = uniqBy([...entities, ...state.value], 'id');
    },
    countView: (state, action) => {
      const id = action.payload as string;
      const video = state.value.find((v) => v.id === id);
      if (video) video.views += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVideosAsync.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(fetchVideosAsync.fulfilled, (state, action) => {
      // Create full URLs when necessary.
      const videos = action.payload as Video[];
      const entities = videos.map((video) => ({
        ...video,
        thumbnail: `${BASE_URL}/previews/${video.thumbnail}`,
      }));

      state.status = 'succeeded';
      state.value = entities.reverse();
    });
    builder.addCase(fetchVideosAsync.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error?.message ?? 'Unknown error';
    });
    builder.addCase(removeVideoAsync.fulfilled, (state, action) => {
      state.value = state.value.filter(({ id }) => id !== action.payload);
    });
  },
});

/* ACTIONS */

export const { singleUpdate, batchUpdate, countView } = videosSlice.actions;

/* SELECTORS */

export const getVideos = (state: RootState) => state.videos.value;
export const getStatus = (state: RootState) => state.videos.status;

export default videosSlice.reducer;
