import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../store/redux-hooks/redux-hooks';
import { Menu } from 'antd';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { ROLE_MENUS } from './menuData';
import { IMenu } from '../../models/IMenu';
import { onShowMenu } from '../../slices/CommonSlice';

const Menus = () => {
  const [menus, setMenus] = useState<IMenu[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMenus(ROLE_MENUS['BingoDepositor']['menu']);
  }, []);

  const onMenuClicked = (menu: IMenu) => {
    if (menu.name.toLowerCase() === 'logout') {
      navigate('/');
      window.location.reload();
    } else {
      navigate(menu.route ?? '');
      dispatch(onShowMenu(false));
    }
  };

  const renderMenu = (menu: IMenu) => {
    return menu.items && menu.items.length > 0 ? (
      <Menu.SubMenu
        key={menu.id}
        className="ml-[-4px]"
        icon={<Icon icon={menu.icon ?? ''} fontSize={40} />}
        title={menu.name}
      >
        {menu.items.map((item: IMenu) => (
          <Menu.Item
            onClick={() => onMenuClicked(item)}
            className="mb-2 menu-fontsize"
            style={{ zIndex: '1000' }}
            icon={
              <img
                src={'material-symbols:menu'}
                color="white"
                alt="Menu Icon"
              />
            }
            key={item.id}
          >
            {item.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    ) : (
      <Menu.Item
        className={`mb-2 ${menu.className}`}
        key={menu.id}
        onClick={() => onMenuClicked(menu)}
        icon={<Icon icon={menu.icon ?? ''} fontSize={40} />}
      >
        {menu.name}
      </Menu.Item>
    );
  };
  return (
    <div className="flex flex-col items-center justify-start w-full">
      <Menu mode="inline" defaultSelectedKeys={['1']} className="w-full pr-10">
        {menus.map((menu) => renderMenu(menu))}
      </Menu>
    </div>
  );
};

export default Menus;
