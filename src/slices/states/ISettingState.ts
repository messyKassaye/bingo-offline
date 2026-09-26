import { IGame } from '../../models/IGame';
import { ISettingItems } from '../../models/ISettingItems';

export interface ISettingState {
  settingItems: ISettingItems;
  selectedGame: number;
}
