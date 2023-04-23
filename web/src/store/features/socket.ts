import { createSlice, createAction } from '@reduxjs/toolkit';

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

export default tokenSlice.reducer;
