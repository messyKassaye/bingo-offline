interface IDrawNumber {
  calledNumber: number;
  bingoShopId: number;
}
export interface ICalledDrawNumber {
  status: boolean;
  message: string;
  code: number;
  data: IDrawNumber;
}
