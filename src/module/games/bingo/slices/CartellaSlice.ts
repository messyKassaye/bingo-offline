import { createSlice } from '@reduxjs/toolkit';
import { ICartellaState } from './states/ICartellaState';
import { ICartella } from '../model/ICartella';
import { IAddCartella } from '../model/IAddCartella';
import { IPlayerMarked } from '../../../../models/IPlayerMarked';

const initialState: ICartellaState = {
  selectedCartella: [],
  allCartella: [],
  totalCartella: 0,
  winnerCartellas: [],
  playerMarkedNumbers: {},
};

const cartellaSlice = createSlice({
  name: 'cartellaSlice',
  initialState,
  reducers: {
    addAllCartella: (state, action) => {
      state.allCartella = action.payload;
    },
    updateAllCartellaState: (state, action) => {
      const cartellaData: ICartella = action.payload;
      state.allCartella = state.allCartella.map((cart) =>
        cart.cartellaNumber === Number(cartellaData.cartellaNumber)
          ? { ...cart, isSelected: cartellaData.isSelected }
          : cart,
      );
    },
    addSelectedCartella: (state, action) => {
      state.selectedCartella = [...state.selectedCartella, action.payload];
    },

    addMultipleCartella: (state, action) => {
      state.selectedCartella = action.payload;
    },
    updateSelectedCartellaAfterAdded: (state, action) => {
      const cartellaData: IAddCartella = action.payload;
      const isSelected = state.selectedCartella.includes(
        cartellaData.selectedCartella,
      );
      if (isSelected) {
        state.selectedCartella = state.selectedCartella.filter(
          (cart) => cart !== cartellaData.selectedCartella,
        );
      } else {
        state.selectedCartella = [
          ...state.selectedCartella,
          cartellaData.selectedCartella,
        ];
      }
      state.allCartella = state.allCartella.map((cart) =>
        cart.cartellaNumber === cartellaData.selectedCartella
          ? { ...cart, isSelected: !isSelected }
          : cart,
      );
    },
    updateTotalCartella: (state, action) => {
      state.totalCartella = action.payload;
    },
    updateWinnerCartellas: (state, action) => {
      state.winnerCartellas = action.payload;
    },

    updatePlayerMarked: (state, action) => {
      const data: IPlayerMarked = action.payload;

      const previousData = state.playerMarkedNumbers[data.cardNumber];
      if (previousData) {
        const item = state.playerMarkedNumbers[data.cardNumber].find(
          (_) => _ === data.marked,
        );
        if (item) {
          state.playerMarkedNumbers[data.cardNumber] =
            state.playerMarkedNumbers[data.cardNumber].filter(
              (_) => _ !== data.marked,
            );
        } else {
          state.playerMarkedNumbers[data.cardNumber] = [
            ...(state.playerMarkedNumbers[data.cardNumber] ?? []),
            data.marked,
          ];
        }
      } else {
        state.playerMarkedNumbers[data.cardNumber] = [
          ...(state.playerMarkedNumbers[data.cardNumber] ?? []),
          data.marked,
        ];
      }
    },

    removePlayerMarked: (state, action) => {
      state.playerMarkedNumbers = {};
    },
  },
});

export const {
  addMultipleCartella,
  addSelectedCartella,
  addAllCartella,
  updateAllCartellaState,
  updateSelectedCartellaAfterAdded,
  updateTotalCartella,
  updateWinnerCartellas,
  updatePlayerMarked,
  removePlayerMarked,
} = cartellaSlice.actions;
export default cartellaSlice.reducer;
