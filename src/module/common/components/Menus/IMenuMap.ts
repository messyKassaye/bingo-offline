import { IMenu } from '../../models/IMenu';

interface IGameMenu {
  [gameName: string]: IMenu[];
}

export interface IRoleMenus {
  [roleId: string]: IGameMenu;
}
export type MenuMap = {
  [key: string]: IMenu[];
};
