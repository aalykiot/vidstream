import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setToken } from './tokenSlice';

const BASE_URL = 'http://localhost:8080/api';

/* ASYNC THUNKS */

export const fetchVideosAsync = createAsyncThunk(
  'videos/fetchVideos',
  async (_, thunkAPI) => {
    const response = await fetch(`${BASE_URL}/videos`);
    const { token, videos } = await response.json();
    const entities = videos.map((video) => ({
      ...video,
      thumbnail: `${BASE_URL}/previews/${video.thumbnail}`,
    }));
    thunkAPI.dispatch(setToken(token));
    return entities;
  }
);

/* STATE */

const initialState = { entities: [], status: 'idle', error: null };

/* REDUCERS */

const videosSlice = createSlice({
  name: 'videos',
  initialState,
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

export const getVideos = (state) => state.videos.entities;
export const getStatus = (state) => state.videos.status;

export default videosSlice.reducer;
