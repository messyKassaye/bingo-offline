import { IDeposit } from '../../../depositor/model/IDeposit';
import { IUserRole } from './IUserRole.model';

export interface IUser {
  id: number;
  name: string;
  phone: string;
  username: string;
  statusId: number;
  userRoles?: IUserRole[];
  depositsSent: IDeposit[];
}
