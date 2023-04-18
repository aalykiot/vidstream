import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit';
import type { RootState } from '../store';

const BASE_URL = 'http://localhost:8080/api';

/* ASYNC THUNKS */

export const fetchTrickPlayAsync = createAsyncThunk(
  'player/fetchTrickPlay',
  async (previews: string[]) => {
    const trickPlay = previews.map(async (id) => {
      const response = await fetch(`${BASE_URL}/previews/${id}`);
      const data = await response.blob();
      return URL.createObjectURL(data);
    });
    return Promise.all(trickPlay);
  }
);

type Video = {
  id: string;
  title: string;
  duration: number;
  size: number;
  available: boolean;
  views: number;
  previews: string[];
  step: number;
  thumbnail: string;
  mimetype: string;
  createdAt: string;
  updatedAt: string;
};

export const fetchMetadataAsync = createAsyncThunk(
  'player/fetchMetadata',
  async (id: string, thunkAPI) => {
    const response = await fetch(`${BASE_URL}/videos/${id}`);
    const video = (await response.json()) as Video;
    thunkAPI.dispatch(fetchTrickPlayAsync(video.previews));
    return video;
  }
);

/* STATE */

type Status = 'idle' | 'pending' | 'succeeded' | 'failed';

type Value<T> = {
  status: Status;
  value: T | null;
};

type InitState = {
  source: string | null;
  metadata: Value<Video>;
  trickPlay: Value<string[]>;
  error: SerializedError | null;
};

const initialState = {
  source: null,
  metadata: {
    status: 'idle',
    value: null,
  },
  trickPlay: {
    status: 'idle',
    value: null,
  },
  error: null,
} as InitState;

/* REDUCERS */

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMetadataAsync.pending, (state) => {
      state.metadata.status = 'pending';
    });
    builder.addCase(fetchMetadataAsync.fulfilled, (state, action) => {
      state.metadata.status = 'succeeded';
      state.metadata.value = action.payload;
      state.source = `${BASE_URL}/video-playback/${action.payload.id}`;
    });
    builder.addCase(fetchMetadataAsync.rejected, (state, action) => {
      state.metadata.status = 'failed';
      state.error = action.error;
    });
    builder.addCase(fetchTrickPlayAsync.pending, (state) => {
      state.trickPlay.status = 'pending';
    });
    builder.addCase(fetchTrickPlayAsync.fulfilled, (state, action) => {
      state.trickPlay.status = 'succeeded';
      state.trickPlay.value = action.payload;
    });
    builder.addCase(fetchTrickPlayAsync.rejected, (state, action) => {
      state.trickPlay.status = 'failed';
      state.error = action.error;
    });
  },
});

/* SELECTORS */

export const getSource = (s: RootState) => s.player.source;
export const getMetadata = (s: RootState) => s.player.metadata.value;
export const getMetadataStatus = (s: RootState) => s.player.metadata.status;
export const getTrickPlay = (s: RootState) => s.player.trickPlay.value;
export const getTrickPlayStatus = (s: RootState) => s.player.trickPlay.status;

export default playerSlice.reducer;
