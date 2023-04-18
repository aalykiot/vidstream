import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit';
import type { RootState } from '../index';

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

type InitState = {
  source: string | null;
  metadata: Video | null;
  metadataStatus: Status;
  trickPlay: string[];
  trickPlayStatus: Status;
  error: SerializedError | null;
};

const initialState = {
  source: null,
  metadata: null,
  metadataStatus: 'idle',
  trickPlay: [],
  trickPlayStatus: 'idle',
  error: null,
} as InitState;

/* REDUCERS */

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMetadataAsync.pending, (state) => {
      state.metadataStatus = 'pending';
    });
    builder.addCase(fetchMetadataAsync.fulfilled, (state, action) => {
      state.metadataStatus = 'succeeded';
      state.metadata = action.payload;
      state.source = `${BASE_URL}/video-playback/${action.payload.id}`;
    });
    builder.addCase(fetchMetadataAsync.rejected, (state, action) => {
      state.metadataStatus = 'failed';
      state.error = action.error;
    });
    builder.addCase(fetchTrickPlayAsync.pending, (state) => {
      state.trickPlayStatus = 'pending';
    });
    builder.addCase(fetchTrickPlayAsync.fulfilled, (state, action) => {
      state.trickPlayStatus = 'succeeded';
      state.trickPlay = action.payload;
    });
    builder.addCase(fetchTrickPlayAsync.rejected, (state, action) => {
      state.trickPlayStatus = 'failed';
      state.error = action.error;
    });
  },
});

/* SELECTORS */

export const getSource = (state: RootState) => state.player.source;
export const getMetadata = (state: RootState) => state.player.metadata;
export const getTrickPlay = (state: RootState) => state.player.trickPlay;
export const getMetadataStatus = (state: RootState) =>
  state.player.metadataStatus;
export const getTrickPlayStatus = (state: RootState) =>
  state.player.trickPlayStatus;

export default playerSlice.reducer;
