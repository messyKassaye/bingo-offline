import { ICartella } from '../../model/ICartella';

export interface ICartellaState {
  allCartella: ICartella[];
  selectedCartella: number[];
  totalCartella: number;
  winnerCartellas: number[];
  playerMarkedNumbers: Record<number, string[]>;
}
