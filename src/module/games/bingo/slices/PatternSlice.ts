import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IPatternState } from './states/IPatternState';
import { IGamePattern } from '../model/IGamePattern';
import AxiosService from '../../../common/services/https.service';
import { backend_url } from '../../../../utils/backend_routes';
import { AxiosError } from 'axios';
import { getOfflineAccountId, getOfflinePatterns } from '../../../../config/db/services/OfflineBingoService';

const initialState: IPatternState = {
  selectedPattern: 'default',
  patternId: 0,
  gamePatterns: {
    status: false,
    message: '',
    code: 0,
    data: [],
  },
  changePattern: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
};

export const gamePatternsAPI = createAsyncThunk(
  'gamePatternsAPI',
  async (_, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await getOfflinePatterns(accountId);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not load local game patterns.');
      }
    }
    try {
      const response = await AxiosService().get(
        `${backend_url.bingo.gamePatterns}`,
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

interface IChangePattern {
  patternId: number;
}
export const changePatternAPI = createAsyncThunk(
  'changePatternAPI',
  async (data: IChangePattern, { rejectWithValue }) => {
    if (getOfflineAccountId() !== null) {
      return { status: true, message: 'Pattern selected locally.' };
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.changePattern}`,
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
const patternSlices = createSlice({
  name: 'patternSlices',
  initialState,
  reducers: {
    changePattern: (state, action) => {
      state.selectedPattern = action.payload;
    },
    changePatternId: (state, action) => {
      state.patternId = Number(action.payload);
    },
    addGamePatterns: (state, action) => {
      state.gamePatterns = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(gamePatternsAPI.pending, (state: any) => {
        state.gamePatterns.status = false;
        state.gamePatterns.loading = true;
      })
      .addCase(gamePatternsAPI.fulfilled, (state: any, action: any) => {
        state.gamePatterns.data = action.payload;
        state.gamePatterns.loading = false;
        state.gamePatterns.status = true;
        if (!action.payload.some((pattern: IGamePattern) => pattern.value === state.selectedPattern)) {
          state.selectedPattern = action.payload[0]?.value ?? 'default';
          state.patternId = action.payload[0]?.id ?? 0;
        }
      })
      .addCase(gamePatternsAPI.rejected, (state: any, action: any) => {
        state.gamePatterns.status = false;
        state.gamePatterns.loading = false;
        state.gamePatterns.error = true;
        state.gamePatterns.errorMessage = action.payload;
      })
      // change game pattern
      .addCase(changePatternAPI.pending, (state: any) => {
        state.changePattern.status = false;
        state.changePattern.loading = true;
      })
      .addCase(changePatternAPI.fulfilled, (state: any, action: any) => {
        state.changePattern.data = action.payload;
        state.changePattern.loading = false;
        state.changePattern.status = true;
      })
      .addCase(changePatternAPI.rejected, (state: any, action: any) => {
        state.changePattern.status = false;
        state.changePattern.loading = false;
        state.changePattern.error = true;
        state.changePattern.errorMessage = action.payload;
      });
  },
});

export const { changePattern, changePatternId } = patternSlices.actions;

export default patternSlices.reducer;
