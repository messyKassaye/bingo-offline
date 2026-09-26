import { createSlice } from '@reduxjs/toolkit';
import { IAuthenticationState } from './states/IAuthenticationState';
import { isUserLoggedIn } from '../services/TokenService';

const initialState: IAuthenticationState = {
  isUserLoggedIn: isUserLoggedIn(),
  currentRole: 0,
  currentGameApp: 0,
  enabledGames: [],
};

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    changeAuthenticationState: (state, action) => {
      state.isUserLoggedIn = action.payload;
    },
    changeCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },
    changeCurrentGameApp: (state, action) => {
      state.currentGameApp = action.payload;
    },
    changeEnabledGames: (state, action) => {
      state.enabledGames = action.payload;
    },
  },
});

export const {
  changeAuthenticationState,
  changeCurrentRole,
  changeCurrentGameApp,
  changeEnabledGames,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
