import { createSlice } from '@reduxjs/toolkit';
import { ITokenState } from './states/ITokenState';

const initialState: ITokenState = {
  tokens: {
    accessToken: '',
  },
};

const tokenSlice = createSlice({
  name: 'tokenSlice',
  initialState,
  reducers: {
    addAccessToken: (state, action) => {
      state.tokens = action.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const { addAccessToken } = tokenSlice.actions;
export default tokenSlice.reducer;
