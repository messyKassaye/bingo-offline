import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IUserState } from './states/IUserState';
import AxiosService from '../services/https.service';
import { backend_url } from '../../../utils/backend_routes';
import { AxiosError } from 'axios';

const initialState: IUserState = {
  user: {
    status: false,
    message: '',
    code: 0,
    data: {
      id: 0,
      name: '',
      phone: '',
      username: '',
      statusId: 0,
      depositsSent: [],
    },
  },
  cashierDashboard: {
    status: false,
    message: '',
    code: 0,
    data: null,
  },
};

export const meQuery = createAsyncThunk(
  'api/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosService().get(backend_url.me);
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

export const bingoCashierDashboardAPI = createAsyncThunk(
  'bingoCashierDashboardAPI',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosService().get(
        backend_url.bingo.cashierDashboard,
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

const UserSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(meQuery.pending, (state: any) => {
        state.user.status = false;
        state.user.loading = true;
        state.user.data = [];
      })
      .addCase(meQuery.fulfilled, (state: any, action: any) => {
        state.user.data = action.payload;
        state.user.loading = false;
        state.user.status = true;
      })
      .addCase(meQuery.rejected, (state: any, action: any) => {
        state.user.status = false;
        state.user.loading = false;
        state.user.error = true;
        state.user.errorMessage = action.payload;
      })
      //cashier dashboard
      .addCase(bingoCashierDashboardAPI.pending, (state: any) => {
        state.cashierDashboard.status = false;
        state.cashierDashboard.loading = true;
        state.cashierDashboard.data = null;
      })
      .addCase(
        bingoCashierDashboardAPI.fulfilled,
        (state: any, action: any) => {
          state.cashierDashboard.data = action.payload;
          state.cashierDashboard.loading = false;
          state.cashierDashboard.status = true;
        },
      )
      .addCase(bingoCashierDashboardAPI.rejected, (state: any, action: any) => {
        state.cashierDashboard.status = false;
        state.cashierDashboard.loading = false;
        state.cashierDashboard.error = true;
        state.cashierDashboard.errorMessage = action.payload;
      });
  },
});

export default UserSlice.reducer;
