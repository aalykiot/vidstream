/* eslint-disable @typescript-eslint/no-use-before-define */

import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/* ASYNC THUNKS */

export const BASE_URL = 'http://localhost:8080/api';

export const uploadVideoAsync = createAsyncThunk(
  'upload/uploadVideoAsync',
  async (formData: FormData, thunkAPI) => {
    await axios.post(`${BASE_URL}/videos/upload`, formData, {
      onUploadProgress(progressEvent) {
        const { loaded, total = Infinity } = progressEvent;
        const completed = Math.round((loaded * 100) / total);
        thunkAPI.dispatch(setProgress(completed));
      },
    });
    // Reset state after 1.5 seconds.
    setTimeout(() => {
      thunkAPI.dispatch(setShowModal(false));
      thunkAPI.dispatch(reset());
    }, 1500);
  }
);

/* STATE */

type Status = 'idle' | 'uploading' | 'succeeded' | 'failed';

type InitState = {
  show: boolean;
  status: Status;
  progress: number;
  error: string | null;
};

const initialState = {
  show: false,
  status: 'idle',
  progress: 0,
  error: null,
} as InitState;

/* REDUCERS */

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setShowModal(state, action) {
      state.show = action.payload;
    },
    setProgress(state, action) {
      state.progress = action.payload;
    },
    reset(state) {
      state.status = 'idle';
      state.progress = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(uploadVideoAsync.pending, (state) => {
      state.status = 'uploading';
    });
    builder.addCase(uploadVideoAsync.fulfilled, (state) => {
      state.status = 'succeeded';
      state.progress = 100;
    });
    builder.addCase(uploadVideoAsync.rejected, (state, action) => {
      state.status = 'failed';
      state.progress = 100;
      state.error = action.error?.message ?? 'unknown error';
    });
  },
});

/* ACTIONS */

export const { setShowModal, setProgress, reset } = uploadSlice.actions;

/* SELECTORS */

export const showModal = (s: RootState) => s.upload.show;
export const getProgress = (s: RootState) => s.upload.progress;
export const getUploadStatus = (s: RootState) => s.upload.status;
export const getUploadError = (s: RootState) => s.upload.error;

export default uploadSlice.reducer;
