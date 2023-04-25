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
        // eslint-disable-next-line
        thunkAPI.dispatch(setProgress(completed));
      },
    });
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
      state.error = action.error?.message ?? 'Unknown error';
    });
  },
});

/* ACTIONS */

export const { setShowModal, setProgress } = uploadSlice.actions;

/* SELECTORS */

export const showModal = (s: RootState) => s.upload.show;
export const getProgress = (s: RootState) => s.upload.progress;
export const getUploadStatus = (s: RootState) => s.upload.progress;

export default uploadSlice.reducer;
