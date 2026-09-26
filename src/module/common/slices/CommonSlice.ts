import { createSlice } from '@reduxjs/toolkit';
import { ICommonState } from './states/ICommonState';

const initialState: ICommonState = {
  showMenu: false,
};

const commonSlice = createSlice({
  name: 'commonSlice',
  initialState,
  reducers: {
    onShowMenu: (state, action) => {
      state.showMenu = action.payload;
    },
  },
});

export const { onShowMenu } = commonSlice.actions;

export default commonSlice.reducer;
