import { IBingoShop } from './IBIngoShop';

export interface ICashierBingoShop {
  id: number;
  agentShopOwnerId: number;
  bingoShopId: number;
  cashierId: number;
  agentShop: IBingoShop;
}
