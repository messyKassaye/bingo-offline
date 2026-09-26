export interface IBingoGame {
  id: number;
  betAmount: number;
  selectedCartella: number[];
  lockedCartella: number[];
  calledNumbers: number[];
  status: boolean;
  gamePattern: number;
}
