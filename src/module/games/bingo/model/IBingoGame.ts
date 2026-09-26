import { IGamePattern } from './IGamePattern';

export interface IBingoGame {
  id: number;
  bingoShopId: number;
  betAmount: number;
  selectedCartella: number[];
  lockedCartella: number[];
  calledNumbers: number[];
  gamePattern: IGamePattern;
  isCalling: boolean;
}
