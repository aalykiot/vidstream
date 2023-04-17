import { createSlice } from '@reduxjs/toolkit';

/* STATE */

const initialState = null;

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
