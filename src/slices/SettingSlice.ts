import { createSlice } from '@reduxjs/toolkit';
import { ISettingState } from './states/ISettingState';

const initialState: ISettingState = {
  settingItems: {
    serverAddress: '',
    cashierUsername: '',
    cashierPassword: '',
  },
  selectedGame: 0,
};

const settingSlice = createSlice({
  name: 'settingSlice',
  initialState,
  reducers: {
    handleChangeSetting: (state, action) => {
      state.settingItems = action.payload;
    },
    changeSelectedGame: (state, action) => {
      state.selectedGame = action.payload;
    },
  },
});

export const { handleChangeSetting, changeSelectedGame } = settingSlice.actions;
export default settingSlice.reducer;
