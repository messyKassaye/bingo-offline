import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IBingoGameState } from './states/IBingoGameState';
import AxiosService from '../../../common/services/https.service';
import { backend_url } from '../../../../utils/backend_routes';
import { AxiosError } from 'axios';
import { IAddCartella } from '../model/IAddCartella';
import { IUpdateBingoGame } from '../model/IUpdateBIngoGame';
import { IStartNewBingoGame } from '../model/IStartNewBingoGame';
import { IBingoGame } from '../model/IBingoGame';
import { getOfflineAccountId, updateOfflineGame, updateOfflineBetAmount, startOfflineGame, addOfflineCartella, checkOfflineWinner, lockOfflineCartella, endOfflineGame } from '../../../../config/db/services/OfflineBingoService';
import type { RootState } from '../../../../store/store';

const initialState: IBingoGameState = {
  addCartella: {
    status: false,
    message: '',
    code: 0,
    data: {
      betAmount: 0,
      selectedCartella: 0,
      isSelect: false,
      gamePatternId: 0,
    },
  },
  betAmount: 20,
  winAmount: 0,
  updateBetAmount: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  isGameStarted: false,
  selectedCartellaClickCount: 10,

  startGame: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
      code: 0,
      data: {
        calledNumber: 0,
        bingoShopId: 0,
      },
    },
  },
  stopGame: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  calledNumber: [],
  checkWinner: {
    status: false,
    message: '',
    code: 0,
    data: {
      hasWon: false,
      winningLines: [],
    },
  },
  endBingoGame: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  isInsuffiecientBalance: false,
  latestCalledNumber: {
    letter: '',
    calledNumber: 0,
  },
  lockCartella: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  selectedGamePatterns: [],
  startNewBingoGame: {
    status: false,
    message: '',
    code: 0,
    data: null,
  },
  activeGame: {
    id: 0,
    bingoShopId: 0,
    betAmount: 0,
    selectedCartella: [],
    lockedCartella: [],
    calledNumbers: [],
    gamePattern: {
      id: 0,
      name: '',
      value: '',
      status: 0,
    },
    isCalling: false,
  },
  intervalTime: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  refund: {
    status: false,
    message: '',
    code: 0,
    data: {
      status: false,
      message: '',
    },
  },
  disableCartellas: false,
  addCalledNumbers: {
    status: false,
    message: '',
  },
};

export const addCartellaAPI = createAsyncThunk(
  'addCartellaAPI',
  async (data: IAddCartella, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await addOfflineCartella(accountId, data);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not save cartella selection.');
      }
    }
    try {
      const response = await AxiosService().post(
        backend_url.bingo.addCartella,
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

export const updateBingoBetAmount = createAsyncThunk(
  'updateBingoBetAmount',
  async (data: IUpdateBingoGame, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        const game = await updateOfflineBetAmount(accountId, data.betAmount);
        return { status: true, message: 'Bet amount updated locally.', game };
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not update bet amount.');
      }
    }
    try {
      const response = await AxiosService().post(
        backend_url.bingo.updateBetAmount,
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

export const startBingoGameAPI = createAsyncThunk(
  'startBingoGameAPI',
  async (_, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) return { status: true, message: 'Offline game ready.' };
    try {
      const response = await AxiosService().get(
        `${backend_url.bingo.startGame}`,
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

export const stopBingoGameAPI = createAsyncThunk(
  'stopBingoGameAPI',
  async (_, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        await updateOfflineGame(accountId, (game) => { game.isCalling = false; });
        return { status: true, message: 'Game paused.' };
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not pause game.');
      }
    }
    try {
      const response = await AxiosService().get(
        `${backend_url.bingo.stopGame}`,
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

type IEndGameProps = {
  winnerCartellas: number[];
};
export const endBingoGameAPI = createAsyncThunk(
  'endBingoGameAPI',
  async (data: IEndGameProps, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await endOfflineGame(accountId, 'ended');
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not end game.');
      }
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.endBingoGame}`,
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

interface ILockArgument {
  cartellaNumber: number;
}
export const lockCartellaAPI = createAsyncThunk(
  'lockCartellaAPI',
  async (args: ILockArgument, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await lockOfflineCartella(accountId, args.cartellaNumber);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not lock cartella.');
      }
    }
    try {
      const response = await AxiosService().get(
        `${backend_url.bingo.lockCartella}${args.cartellaNumber}`,
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

interface ICheckArguments {
  cartellaNumber: number;
  calledNumbers: number[];
}
export const checkGameWinnerAPI = createAsyncThunk(
  'checkGameWinnerAPI',
  async (data: ICheckArguments, { rejectWithValue, getState }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        const selectedPattern = (getState() as RootState).PatternSlice.selectedPattern;
        return await checkOfflineWinner(
          accountId,
          data.cartellaNumber,
          data.calledNumbers,
          selectedPattern,
        );
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not check winner.');
      }
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.checkWinner}`,
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

export const startNewBingoGameAPI = createAsyncThunk(
  'startNewBingoGameAPI',
  async (data: IStartNewBingoGame, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await startOfflineGame(accountId, data.gamePattern, data.betAmount);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not create a game.');
      }
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.startNewGame}`,
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

interface BingoGameTimeInteral {
  intervalTime: number;
}
export const updateBingoGameTimeIntervalAPI = createAsyncThunk(
  'updateBingoGameTimeIntervalAPI',
  async (data: BingoGameTimeInteral, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        await updateOfflineGame(accountId, (game) => {
          (game as IBingoGame & { intervalTime?: number }).intervalTime = data.intervalTime;
        });
        return { status: true, message: 'Calling speed saved locally.' };
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not save calling speed.');
      }
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.updateGameCallerTime}`,
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

export const refunBingoGameAPI = createAsyncThunk(
  'refunBingoGameAPI',
  async (data: IEndGameProps, { rejectWithValue }) => {
    const accountId = getOfflineAccountId();
    if (accountId !== null) {
      try {
        return await endOfflineGame(accountId, 'refunded');
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Could not refund game.');
      }
    }
    try {
      const response = await AxiosService().post(
        `${backend_url.bingo.refund}`,
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

const bingoGameSlice = createSlice({
  name: 'bingoGameSlice',
  initialState,
  reducers: {
    updateAddCartellStatus: (state, action) => {
      state.addCartella.status = false;
    },
    changeBetAmount: (state, action) => {
      state.betAmount = action.payload;
    },
    updateWinAmount: (state, action) => {
      state.winAmount = action.payload;
    },
    updateBingoBetAmountStatus: (state, action) => {
      state.updateBetAmount.status = false;
    },
    handleGameStarted: (state, action) => {
      state.isGameStarted = action.payload;
    },
    increamentClickCount: (state, action) => {
      state.selectedCartellaClickCount = state.selectedCartellaClickCount += 1;
    },
    resetClickCount: (state, action) => {
      state.selectedCartellaClickCount = 0;
    },
    addCalled: (state, action) => {
      state.calledNumber = Array.from(
        new Set([...state.calledNumber, action.payload]),
      );
    },
    addMultipleCalledNumber: (state, action) => {
      state.calledNumber = action.payload;
    },
    removeCalledNumber: (state, action) => {
      state.calledNumber = [];
    },
    updateBingoGameWinnerResult: (state, action) => {
      state.checkWinner.data = {
        hasWon: false,
        winningLines: [],
      };
      state.checkWinner.status = false;
    },
    updateEndGameState: (state, action) => {
      state.endBingoGame.status = action.payload;
    },

    updateInsuficient: (state, action) => {
      state.isInsuffiecientBalance = action.payload;
    },
    updateLatestCalledNumber: (state, action) => {
      state.latestCalledNumber = action.payload;
    },
    clearCalledNumber: (state, action) => {
      state.latestCalledNumber = {
        letter: '',
        calledNumber: 0,
      };
    },

    clearGamePattern: (state, action) => {
      state.selectedGamePatterns = [];
    },

    updateRefundGameState: (state, action) => {
      state.refund.data = {
        status: false,
        message: '',
      };
    },

    handleDisableCartella: (state, action) => {
      state.disableCartellas = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCartellaAPI.pending, (state: any) => {
        state.addCartella.status = false;
        state.addCartella.loading = true;
        state.addCartella.data = [];
      })
      .addCase(addCartellaAPI.fulfilled, (state: any, action: any) => {
        state.addCartella.data = action.payload;
        state.addCartella.loading = false;
        state.addCartella.status = true;
      })
      .addCase(addCartellaAPI.rejected, (state: any, action: any) => {
        state.addCartella.status = false;
        state.addCartella.loading = false;
        state.addCartella.error = true;
        state.addCartella.errorMessage = action.payload;
      })
      //update bingo game
      .addCase(updateBingoBetAmount.pending, (state: any) => {
        state.updateBetAmount.status = false;
        state.updateBetAmount.loading = true;
        state.updateBetAmount.data = [];
      })
      .addCase(updateBingoBetAmount.fulfilled, (state: any, action: any) => {
        state.updateBetAmount.data = action.payload;
        state.updateBetAmount.loading = false;
        state.updateBetAmount.status = true;
      })
      .addCase(updateBingoBetAmount.rejected, (state: any, action: any) => {
        state.updateBetAmount.status = false;
        state.updateBetAmount.loading = false;
        state.updateBetAmount.error = true;
        state.updateBetAmount.errorMessage = action.payload;
      })
      //start game API
      .addCase(startBingoGameAPI.pending, (state: any) => {
        state.startGame.status = false;
        state.startGame.loading = true;
      })
      .addCase(startBingoGameAPI.fulfilled, (state: any, action: any) => {
        state.startGame.data = action.payload;
        state.startGame.loading = false;
        state.startGame.status = true;
      })
      .addCase(startBingoGameAPI.rejected, (state: any, action: any) => {
        state.startGame.status = false;
        state.startGame.loading = false;
        state.startGame.error = true;
        state.startGame.errorMessage = action.payload;
      })
      // stop game
      .addCase(stopBingoGameAPI.pending, (state: any) => {
        state.stopGame.status = false;
        state.stopGame.loading = true;
        state.stopGame.data = [];
      })
      .addCase(stopBingoGameAPI.fulfilled, (state: any, action: any) => {
        state.stopGame.data = action.payload;
        state.stopGame.loading = false;
        state.stopGame.status = true;
      })
      .addCase(stopBingoGameAPI.rejected, (state: any, action: any) => {
        state.stopGame.status = false;
        state.stopGame.loading = false;
        state.stopGame.error = true;
        state.stopGame.errorMessage = action.payload;
      })
      // check game winner
      .addCase(checkGameWinnerAPI.pending, (state: any) => {
        state.checkWinner.status = false;
        state.checkWinner.loading = true;
      })
      .addCase(checkGameWinnerAPI.fulfilled, (state: any, action: any) => {
        state.checkWinner.data = action.payload;
        state.checkWinner.loading = false;
        state.checkWinner.status = true;
      })
      .addCase(checkGameWinnerAPI.rejected, (state: any, action: any) => {
        state.checkWinner.status = false;
        state.checkWinner.loading = false;
        state.checkWinner.error = true;
        state.checkWinner.errorMessage = action.payload;
      })
      // end bing game
      .addCase(endBingoGameAPI.pending, (state: any) => {
        state.endBingoGame.status = false;
        state.endBingoGame.loading = true;
      })
      .addCase(endBingoGameAPI.fulfilled, (state: any, action: any) => {
        state.endBingoGame.data = action.payload;
        state.endBingoGame.loading = false;
        state.endBingoGame.status = true;
      })
      .addCase(endBingoGameAPI.rejected, (state: any, action: any) => {
        state.endBingoGame.status = false;
        state.endBingoGame.loading = false;
        state.endBingoGame.error = true;
        state.endBingoGame.errorMessage = action.payload;
      })
      // lock cartella
      .addCase(lockCartellaAPI.pending, (state: any) => {
        state.lockCartella.status = false;
        state.lockCartella.loading = true;
      })
      .addCase(lockCartellaAPI.fulfilled, (state: any, action: any) => {
        state.lockCartella.data = action.payload;
        state.lockCartella.loading = false;
        state.lockCartella.status = true;
      })
      .addCase(lockCartellaAPI.rejected, (state: any, action: any) => {
        state.lockCartella.status = false;
        state.lockCartella.loading = false;
        state.lockCartella.error = true;
        state.lockCartella.errorMessage = action.payload;
      })
      // start new Bingo Game API
      .addCase(startNewBingoGameAPI.pending, (state: any) => {
        state.startNewBingoGame.status = false;
        state.startNewBingoGame.loading = true;
      })
      .addCase(startNewBingoGameAPI.fulfilled, (state: any, action: any) => {
        state.startNewBingoGame.data = action.payload;
        state.startNewBingoGame.loading = false;
        state.startNewBingoGame.status = true;
      })
      .addCase(startNewBingoGameAPI.rejected, (state: any, action: any) => {
        state.startNewBingoGame.status = false;
        state.startNewBingoGame.loading = false;
        state.startNewBingoGame.error = true;
        state.startNewBingoGame.errorMessage = action.payload;
      })
      // start new Bingo Game API
      .addCase(updateBingoGameTimeIntervalAPI.pending, (state: any) => {
        state.intervalTime.status = false;
        state.intervalTime.loading = true;
      })
      .addCase(
        updateBingoGameTimeIntervalAPI.fulfilled,
        (state: any, action: any) => {
          state.intervalTime.data = action.payload;
          state.intervalTime.loading = false;
          state.intervalTime.status = true;
        },
      )
      .addCase(
        updateBingoGameTimeIntervalAPI.rejected,
        (state: any, action: any) => {
          state.intervalTime.status = false;
          state.intervalTime.loading = false;
          state.intervalTime.error = true;
          state.intervalTime.errorMessage = action.payload;
        },
      )
      // refund game
      .addCase(refunBingoGameAPI.pending, (state: any) => {
        state.refund.status = false;
        state.refund.loading = true;
      })
      .addCase(refunBingoGameAPI.fulfilled, (state: any, action: any) => {
        state.refund.data = action.payload;
        state.refund.loading = false;
        state.refund.status = true;
      })
      .addCase(refunBingoGameAPI.rejected, (state: any, action: any) => {
        state.refund.status = false;
        state.refund.loading = false;
        state.refund.error = true;
        state.refund.errorMessage = action.payload;
      });
  },
});

export const {
  updateAddCartellStatus,
  changeBetAmount,
  updateWinAmount,
  updateBingoBetAmountStatus,
  handleGameStarted,
  increamentClickCount,
  resetClickCount,
  addCalled,
  addMultipleCalledNumber,
  updateBingoGameWinnerResult,
  updateEndGameState,
  removeCalledNumber,
  updateInsuficient,
  updateLatestCalledNumber,
  clearCalledNumber,
  clearGamePattern,
  updateRefundGameState,
  handleDisableCartella,
} = bingoGameSlice.actions;
export default bingoGameSlice.reducer;
