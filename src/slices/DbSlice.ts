import { createSlice } from '@reduxjs/toolkit';
import { IDBState } from './states/IDBState';

const initialState: IDBState = {
  isDBInitialized: false,
};

const dbSlice = createSlice({
  name: 'dbSlice',
  initialState,
  reducers: {
    updateDBInitialization: (state, action) => {
      state.isDBInitialized = action.payload;
    },
  },
});

export const { updateDBInitialization } = dbSlice.actions;

export default dbSlice.reducer;
