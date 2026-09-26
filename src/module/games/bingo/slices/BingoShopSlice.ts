import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IBingoShopState } from './states/IBingoShopState';
import AxiosService from '../../../common/services/https.service';
import { backend_url } from '../../../../utils/backend_routes';
import { AxiosError } from 'axios';
import { loadCashierShop, saveCashierShop } from '../../../../config/db/services/CashierShopCache';
import { isTauri } from '@tauri-apps/api/core';
import {
  getOfflineAccountId,
  getOfflineDeposit,
  getOfflineShop,
} from '../../../../config/db/services/OfflineBingoService';

const initialState: IBingoShopState = {
  cashierBingoShop: {
    status: false,
    message: '',
    code: 0,
    data: {
      id: 0,
      agentShopOwnerId: 0,
      bingoShopId: 0,
      cashierId: 0,
      agentShop: {
        id: 0,
        name: '',
        address: '',
        cartella: 0,
        share: 0,
        status: 0,
        cards: [],
        games: [],
        uniqueId: '',
        deposit: 0,
        cut: 0,
        activeCut: [],
      },
    },
  },
  cashierBingoShopDeposit: {
    status: false,
    message: '',
    code: 0,
    data: null,
  },
  mobilePlayers: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
      data: null,
    },
  },
};

export const getCashierBingoShopAPI = createAsyncThunk(
  'printBingoShopCartellasAPI',
  async (_, { rejectWithValue }) => {
    const offlineAccountId = getOfflineAccountId();
    if (offlineAccountId !== null) {
      try {
        return await getOfflineShop(offlineAccountId);
      } catch (error) {
        return rejectWithValue(
          error instanceof Error ? error.message : 'Could not load local shop data.',
        );
      }
    }
    try {
      const response = await AxiosService().get(
        backend_url.bingo.getCashierBingoShop,
      );
      try {
        if (isTauri()) await saveCashierShop(response.data);
      } catch (cacheError) {
        return rejectWithValue(
          `Shop data was loaded but could not be saved locally: ${String(cacheError)}`,
        );
      }
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError && !err.response) {
        try {
          const cachedShop = await loadCashierShop();
          if (cachedShop) return cachedShop;
        } catch (cacheError) {
          console.error('Unable to load locally cached shop data:', cacheError);
        }
      }
      const error: any = err;
      return rejectWithValue(error?.message ?? 'Unable to load cashier shop data.');
    }
  },
);

export const getCashierBingoShopDepositAPI = createAsyncThunk(
  'getCashierBingoShopDepositAPI',
  async (_, { rejectWithValue }) => {
    const offlineAccountId = getOfflineAccountId();
    if (offlineAccountId !== null) {
      try {
        return await getOfflineDeposit(offlineAccountId);
      } catch (error) {
        return rejectWithValue(
          error instanceof Error ? error.message : 'Could not load local balance.',
        );
      }
    }
    try {
      const response = await AxiosService().get(
        backend_url.bingo.getCashierShopDeposit,
      );
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === AxiosError.ERR_NETWORK) {
          return rejectWithValue(
            'Network error is created. Check your network',
          );
        }
      } else {
        const error: any = err;
        return rejectWithValue(error?.message);
      }
    }
  },
);

interface IMobilePlayers {
  shopId: number;
}
export const getMobilePlayerShopInfoAPI = createAsyncThunk(
  'getMobilePlayerShopInfoAPI',
  async (args: IMobilePlayers, { rejectWithValue }) => {
    try {
      const response = await AxiosService().get(
        `${backend_url.bingo.mobilePlayers}${args.shopId}`,
      );
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === AxiosError.ERR_NETWORK) {
          return rejectWithValue(
            'Network error is created. Check your network',
          );
        }
      } else {
        const error: any = err;
        return rejectWithValue(error?.message);
      }
    }
  },
);

const bingShopSlice = createSlice({
  name: 'bingShopSlice',
  initialState,
  reducers: {
    removeShopCalledNumber: (state, action) => {
      state.cashierBingoShop.data.agentShop.games = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCashierBingoShopAPI.pending, (state: any) => {
        state.cashierBingoShop.status = false;
        state.cashierBingoShop.loading = true;
        state.cashierBingoShop.error = false;
      })
      .addCase(getCashierBingoShopAPI.fulfilled, (state: any, action: any) => {
        state.cashierBingoShop.data = action.payload;
        state.cashierBingoShop.loading = false;
        state.cashierBingoShop.status = true;
      })
      .addCase(getCashierBingoShopAPI.rejected, (state: any, action: any) => {
        state.cashierBingoShop.status = false;
        state.cashierBingoShop.loading = false;
        state.cashierBingoShop.error = true;
        state.cashierBingoShop.errorMessage = action.payload;
      })
      //get cashier shop deposit
      .addCase(getCashierBingoShopDepositAPI.pending, (state: any) => {
        state.cashierBingoShopDeposit.status = false;
        state.cashierBingoShopDeposit.loading = true;
        state.cashierBingoShopDeposit.data = null;
      })
      .addCase(
        getCashierBingoShopDepositAPI.fulfilled,
        (state: any, action: any) => {
          state.cashierBingoShopDeposit.data = action.payload;
          state.cashierBingoShopDeposit.loading = false;
          state.cashierBingoShopDeposit.status = true;
        },
      )
      .addCase(
        getCashierBingoShopDepositAPI.rejected,
        (state: any, action: any) => {
          state.cashierBingoShopDeposit.status = false;
          state.cashierBingoShopDeposit.loading = false;
          state.cashierBingoShopDeposit.error = true;
          state.cashierBingoShopDeposit.errorMessage = action.payload;
        },
      )
      //mobile information
      .addCase(getMobilePlayerShopInfoAPI.pending, (state: any) => {
        state.mobilePlayers.status = false;
        state.mobilePlayers.loading = true;
        state.mobilePlayers.data = null;
      })
      .addCase(
        getMobilePlayerShopInfoAPI.fulfilled,
        (state: any, action: any) => {
          state.mobilePlayers.data = action.payload;
          state.mobilePlayers.loading = false;
          state.mobilePlayers.status = true;
        },
      )
      .addCase(
        getMobilePlayerShopInfoAPI.rejected,
        (state: any, action: any) => {
          state.mobilePlayers.status = false;
          state.mobilePlayers.loading = false;
          state.mobilePlayers.error = true;
          state.mobilePlayers.errorMessage = action.payload;
        },
      );
  },
});

export const { removeShopCalledNumber } = bingShopSlice.actions;
export default bingShopSlice.reducer;
