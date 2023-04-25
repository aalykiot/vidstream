import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/* STATE */

type InitState = {
  showModal: boolean;
};

const initialState = { showModal: false } as InitState;

/* REDUCERS */

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setShowModal(state, action) {
      state.showModal = action.payload;
    },
  },
});

/* ACTIONS */

export const { setShowModal } = uploadSlice.actions;

/* SELECTORS */

export const showModal = (s: RootState) => s.upload.showModal;

export default uploadSlice.reducer;
