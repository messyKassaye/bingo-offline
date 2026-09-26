import { IGenericState } from '../../../../common/models/IGenericState';
import { IResponse } from '../../../../common/models/IResponse';
import { IBingoShop } from '../../model/IBIngoShop';
import { ICashierBingoShop } from '../../model/ICashierBingoShop';

export interface IBingoShopState {
  cashierBingoShop: IGenericState<ICashierBingoShop>;
  cashierBingoShopDeposit: IGenericState<IBingoShop | null>;
  mobilePlayers: IGenericState<IResponse<IBingoShop | null>>;
}
