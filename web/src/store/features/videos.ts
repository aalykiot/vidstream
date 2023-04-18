import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit';
import { setToken } from './token';
import type { RootState } from '../index';

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

const BASE_URL = 'http://localhost:8080/api';

/* ASYNC THUNKS */

export const fetchVideosAsync = createAsyncThunk(
  'videos/fetchVideos',
  async (_, thunkAPI) => {
    const response = await fetch(`${BASE_URL}/videos`);
    const { token, videos } = (await response.json()) as APIResponse;
    const entities = videos.map((video) => ({
      ...video,
      thumbnail: `${BASE_URL}/previews/${video.thumbnail}`,
    }));
    thunkAPI.dispatch(setToken(token));
    return entities;
  }
);

/* STATE */

type InitState = {
  entities: Video[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: SerializedError | null;
};

const initialState = { entities: [], status: 'idle', error: null } as InitState;

/* REDUCERS */

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVideosAsync.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(fetchVideosAsync.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.entities = action.payload;
    });
    builder.addCase(fetchVideosAsync.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error;
    });
  },
});

/* SELECTORS */

export const getVideos = (state: RootState) => state.videos.entities;
export const getStatus = (state: RootState) => state.videos.status;

export default videosSlice.reducer;
