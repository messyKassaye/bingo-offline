import { IBingoGameWinnerResult } from './IBingoGameWinnerResult';

export interface IBingoGameWinnerResponse {
  hasWon: boolean;
  winningLines: IBingoGameWinnerResult[];
}
