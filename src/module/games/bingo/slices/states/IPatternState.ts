import { IGenericState } from '../../../../common/models/IGenericState';
import { IGamePattern } from '../../model/IGamePattern';
import { ISuccessResponse } from '../../model/ISuccessResponse';

export interface IPatternState {
  selectedPattern: string;
  patternId: number;
  gamePatterns: IGenericState<IGamePattern[]>;
  changePattern: IGenericState<ISuccessResponse>;
}
