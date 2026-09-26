import { configureStore } from '@reduxjs/toolkit';
import LanguageSlice from '../slices/LanguageSlice';
import TokenSlice from '../slices/TokenSlice';
import SettingSlice from '../slices/SettingSlice';
import BingoShopSlice from '../module/games/bingo/slices/BingoShopSlice';
import CartellaSlice from '../module/games/bingo/slices/CartellaSlice';
import BingoGameSlice from '../module/games/bingo/slices/BingoGameSlice';
import AudioSlice from '../module/games/bingo/slices/AudioSlice';
import BingoNumberSlice from '../module/games/bingo/slices/BingoNumberSlice';
import DialogSlice from '../slices/DialogSlice';
import UserSlice from '../module/common/slices/UserSlice';
import PatternSlice from '../module/games/bingo/slices/PatternSlice';
import DepositSlice from '../module/depositor/slice/depositSlice';
import CommonSlice from '../module/common/slices/CommonSlice';
import AuthenticationSlice from '../module/common/slices/AuthenticationSlice';
const store = configureStore({
  reducer: {
    LanguageSlice,
    TokenSlice,
    SettingSlice,
    BingoShopSlice,
    CartellaSlice,
    BingoGameSlice,
    AudioSlice,
    BingoNumberSlice,
    DialogSlice,
    UserSlice,
    PatternSlice,
    DepositSlice,
    CommonSlice,
    AuthenticationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
