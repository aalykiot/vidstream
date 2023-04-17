import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost:8080/api';

/* ASYNC THUNKS */

export const fetchMetadataAsync = createAsyncThunk(
  'player/fetchMetadata',
  async (id, thunkAPI) => {
    const response = await fetch(`${BASE_URL}/videos/${id}`);
    const video = await response.json();
    thunkAPI.dispatch(fetchTrickPlayAsync(video.previews));
    return video;
  }
);

export const fetchTrickPlayAsync = createAsyncThunk(
  'player/fetchTrickPlay',
  async (previews) => {
    const trickPlay = previews.map(async (id) => {
      const response = await fetch(`${BASE_URL}/previews/${id}`);
      const data = await response.blob();
      return URL.createObjectURL(data);
    });
    return await Promise.all(trickPlay);
  }
);

/* STATE */

const initialState = {
  source: null,
  metadata: null,
  metadataStatus: 'idle',
  trickPlay: [],
  trickPlayStatus: 'idle',
  error: null,
};

/* REDUCERS */

const playerSlice = createSlice({
  name: 'player',
  initialState,
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

export const getSource = (state) => state.player.source;
export const getMetadata = (state) => state.player.metadata;
export const getMetadataStatus = (state) => state.player.metadataStatus;
export const getTrickPlay = (state) => state.player.trickPlay;
export const getTrickPlayStatus = (state) => state.player.trickPlayStatus;

export default playerSlice.reducer;
