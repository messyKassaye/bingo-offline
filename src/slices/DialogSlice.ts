import { createSlice } from '@reduxjs/toolkit';
import { IDialogState } from './states/IDialogState';

const initialState: IDialogState = {
  notificationDialog: {
    isOpen: false,
    title: '',
    errorComponent: 0,
    message: '',
    notificationType: 'error',
  },
};

const dialogSlice = createSlice({
  name: 'dialogSlice',
  initialState,
  reducers: {
    openNotification: (state, action) => {
      state.notificationDialog = action.payload;
    },
  },
});

export const { openNotification } = dialogSlice.actions;

export default dialogSlice.reducer;
