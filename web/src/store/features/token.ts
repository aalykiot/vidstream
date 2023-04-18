import { createSlice } from '@reduxjs/toolkit';

/* STATE */

type InitState = number | null;

const initialState = null as InitState;

/* REDUCERS */

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (_, action) => action.payload,
  },
});

/* ACTIONS */

export const { setToken } = tokenSlice.actions;

export default tokenSlice.reducer;
