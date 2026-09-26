import { IGenericState } from '../../../../common/models/IGenericState';
import { IAddCartella } from '../../model/IAddCartella';
import { IBingoGame } from '../../model/IBingoGame';
import { IBingoGameWinnerResponse } from '../../model/IBingoGameWinnerResponse';
import { ICalledDrawNumber } from '../../model/ICalledDrawNumber';
import { ICalledNumber } from '../../model/ICalledNumber';
import { IRules } from '../../model/IRules';
import { ISuccessResponse } from '../../model/ISuccessResponse';

export interface IBingoGameState {
  activeGame: IBingoGame;
  selectedGamePatterns: IRules[];
  addCartella: IGenericState<IAddCartella>;
  updateBetAmount: IGenericState<ISuccessResponse>;
  startNewBingoGame: IGenericState<IBingoGame | null>;
  startGame: IGenericState<ICalledDrawNumber>;
  stopGame: IGenericState<ISuccessResponse>;
  selectedCartellaClickCount: number;
  isGameStarted: boolean;
  betAmount: number;
  winAmount: number;
  calledNumber: number[];
  checkWinner: IGenericState<IBingoGameWinnerResponse>;
  endBingoGame: IGenericState<ISuccessResponse>;
  isInsuffiecientBalance: boolean;
  latestCalledNumber: ICalledNumber;
  lockCartella: IGenericState<ISuccessResponse>;
  intervalTime: IGenericState<ISuccessResponse>;
  refund: IGenericState<ISuccessResponse>;
  disableCartellas: boolean;
  addCalledNumbers: ISuccessResponse;
}
