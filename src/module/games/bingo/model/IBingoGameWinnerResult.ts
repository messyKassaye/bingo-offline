export type Cartella = {
  [key: string]: (number | string)[];
};
export interface IBingoGameWinnerResult {
  hasWon: boolean;
  pattern: string | null; // Name of the winning pattern, e.g., "Horizontal Line"
  index: number;
  cartella: Cartella;
  calledNumbers: number[];
  message: string;
}
