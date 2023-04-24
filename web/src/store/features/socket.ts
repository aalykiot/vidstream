import { createSlice, createAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/* STATE */

type InitState = boolean;

const initialState = false as InitState;

/* REDUCERS */

const tokenSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    connected: () => true,
  },
});

/* ACTIONS */

export const connect = createAction<undefined>('socket/connect');
export const { connected } = tokenSlice.actions;

/* SELECTORS */

export const isSocketConnected = (state: RootState) => state.socket;

export default tokenSlice.reducer;
