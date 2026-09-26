import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IDepositState } from './state/IDepositState';
import { ICreateDeposit } from '../model/ICreateDeposit';
import AxiosService from '../../common/services/https.service';
import { backend_url } from '../../../utils/backend_routes';
import { AxiosError } from 'axios';

const initialState: IDepositState = {
  createDeposit: {
    loading: false,
    status: false,
    message: '',
    code: 0,
    data: {
      phone: '',
      amount: 0,
      senderId: 0,
    },
  },
  dashboardData: [
    {
      id: 1,
      title: 'Number of Deposit',
      data: 0,
      color: '#00bac7',
      currency: '',
      icon: 'solar:money-bag-outline',
      iconColor: '#00bac7',
    },
    {
      id: 2,
      title: 'Total Deposit',
      data: 0,
      color: '#00bac7',
      currency: 'Br',
      icon: 'solar:money-bag-outline',
      iconColor: '#00bac7',
    },
  ],
  depositList: {
    status: false,
    message: '',
    code: 0,
    data: [],
  },
};

export const createDepositAPI = createAsyncThunk(
  'getMobilePlayerShopInfoAPI',
  async (data: ICreateDeposit, { rejectWithValue }) => {
    try {
      const response = await AxiosService().post(
        `${backend_url.onlineBingo.createDeposit}`,
        data,
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

type argsType = {
  userId: number;
};
export const cashierDepositListAPI = createAsyncThunk(
  'cashierDepositListAPI',
  async (data: argsType, { rejectWithValue }) => {
    try {
      const response = await AxiosService().post(
        `${backend_url.onlineBingo.cashierDepositList}`,
        data,
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

const depositSlice = createSlice({
  name: 'depositSlice',
  initialState,
  reducers: {
    updateCreateDepositState: (state, action) => {
      state.createDeposit.status = action.payload;
      state.createDeposit.message = '';
    },
    updateDashboadardData: (state, action) => {
      const data: ICreateDeposit = action.payload;
      state.dashboardData = state.dashboardData.map((deposit) => {
        if (deposit.id === 1) {
          return { ...deposit, data: Number(deposit.data) + 1 };
        }
        if (deposit.id === 2) {
          return {
            ...deposit,
            data: Number(deposit.data) + Number(data.amount),
          };
        }
        return deposit;
      });
    },

    changeDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDepositAPI.pending, (state: any) => {
        state.createDeposit.status = false;
        state.createDeposit.loading = true;
      })
      .addCase(createDepositAPI.fulfilled, (state: any, action: any) => {
        state.createDeposit = action.payload;
      })
      .addCase(createDepositAPI.rejected, (state: any, action: any) => {
        state.createDeposit.status = false;
        state.createDeposit.loading = false;
        state.createDeposit.error = true;
        state.createDeposit.errorMessage = action.payload;
      })
      //cashier depsoit list
      .addCase(cashierDepositListAPI.pending, (state: any) => {
        state.depositList.status = false;
        state.depositList.loading = true;
      })
      .addCase(cashierDepositListAPI.fulfilled, (state: any, action: any) => {
        state.depositList.data = action.payload;
        state.depositList.status = true;
        state.depositList.loading = false;
      })
      .addCase(cashierDepositListAPI.rejected, (state: any, action: any) => {
        state.depositList.status = false;
        state.depositList.loading = false;
        state.depositList.error = true;
        state.depositList.errorMessage = action.payload;
      });
  },
});

export const {
  updateCreateDepositState,
  updateDashboadardData,
  changeDashboardData,
} = depositSlice.actions;

export default depositSlice.reducer;
