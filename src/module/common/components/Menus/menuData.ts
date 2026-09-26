import { IRoleMenus } from './IMenuMap';

export const ROLE_MENUS: IRoleMenus = {
  BingoDepositor: {
    menu: [
      {
        id: 11,
        name: 'Home',
        className: 'menu-item-size',
        icon: 'material-symbols:home-outline',
        route: '/',
      },
      {
        id: 12,
        name: 'Deposit List',
        className: 'menu-item-size',
        icon: 'ph:hand-deposit',
        route: '/depositList',
      },
      {
        id: 13,
        name: 'Logout',
        className: 'menu-item-size',
        icon: 'material-symbols:logout',
        route: '/logout',
      },
    ],
  },
};
