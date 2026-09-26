import { IGenericState } from '../../../common/models/IGenericState';
import { ICreateDeposit } from '../../model/ICreateDeposit';
import { IDashboardReport } from '../../model/IDashboardReport';
import { IDeposit } from '../../model/IDeposit';

export interface IDepositState {
  depositList: IGenericState<IDeposit[]>;
  createDeposit: IGenericState<ICreateDeposit>;
  dashboardData: IDashboardReport[];
}
