import { IBingoCard } from './IBingoCard';
import { ICartellaType } from './ICartellaType';

export interface ICompany {
  id: number;
  name: string;
  share?: number;
  cut?: number;
  cards?: IBingoCard[];
  logo: string;
  status: number;
}
