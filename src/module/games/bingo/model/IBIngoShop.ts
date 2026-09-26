import { IBingoAgentCut } from './IBingoAgentCut';
import { IBingoCard } from './IBingoCard';
import { IBingoGame } from './IBingoGame';
import { ICompany } from './ICompany.modle';

export interface IBingoShop {
  id: number;
  name: string;
  address: string;
  cartella: number;
  share: number;
  status: number;
  userId?: number;
  uniqueId: string;
  companyId?: number;
  parentId?: number | null;
  company?: ICompany;
  cards: IBingoCard[];
  games: IBingoGame[];
  deposit: number;
  cut: number;
  activeCut: IBingoAgentCut[];
}
