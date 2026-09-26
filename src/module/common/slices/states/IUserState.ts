import { IGenericState } from '../../models/IGenericState';
import { IUser } from '../../../games/bingo/model/IUser.model';
import { IBingoCashierDashboard } from '../../../games/bingo/model/IBingoCashierDashboard';

export interface IUserState {
  user: IGenericState<IUser>;
  cashierDashboard: IGenericState<IBingoCashierDashboard | null>;
}
