import { Icon } from '@iconify/react';
import Menus from '../Menus/Menus';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/redux-hooks/redux-hooks';
import { onShowMenu } from '../../slices/CommonSlice';
import { useNavigate } from 'react-router-dom';

const TopNavigation = () => {
  const { showMenu } = useAppSelector((state) => state.CommonSlice);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onMenuClicked = () => {
    dispatch(onShowMenu(!showMenu));
  };

  return (
    <div className="flex flex-col items-start justify-start w-full">
      <div className="flex items-center justify-between w-full bg-[#0e2238] px-1">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center border-none outline-none bg-transparent"
        >
          <span className="text-white text-2xl font-bold">Gulo</span>
          <span className="font-bold text-2xl text-orange-500">Bingo</span>
        </button>
        <div className="flex items-center justify-around gap-1">
          <Icon
            icon={'material-symbols:menu'}
            color="#9EA9B4"
            fontSize={28}
            style={{ width: '50px', height: '50px' }}
            onClick={onMenuClicked}
          />
        </div>
      </div>
      {showMenu && <Menus />}
    </div>
  );
};

export default TopNavigation;
