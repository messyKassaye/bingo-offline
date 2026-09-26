import { createSlice } from '@reduxjs/toolkit';
import { IBingoNumberState } from './states/IBingoNumberState';

const initialState: IBingoNumberState = {
  bingoNumbers: [],
};

const bingoNumberSlice = createSlice({
  name: 'bingoNumberSlice',
  initialState,
  reducers: {
    createBingoNumbers: (state, action) => {
      state.bingoNumbers = action.payload;
    },
  },
});

export const { createBingoNumbers } = bingoNumberSlice.actions;
export default bingoNumberSlice.reducer;
