import { createSlice } from '@reduxjs/toolkit';
import { ILanguageState } from './states/ILanguageState';

const initialState: ILanguageState = {
  selectedLanguage: {
    id: 0,
    code: '',
    name: '',
  },
};

const languageSlice = createSlice({
  name: 'languageSlice',
  initialState,
  reducers: {
    changeLocale: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    changeSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
  },
});

export const { changeLocale } = languageSlice.actions;
export default languageSlice.reducer;
