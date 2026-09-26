import { IUser } from '../../games/bingo/model/IUser.model';

export interface IDeposit {
  id: number;
  amount: number;
  recipientId: number;
  senderId: number;
  method: string;
  statusId: number;
  user: IUser;
  recipient: IUser;
}
