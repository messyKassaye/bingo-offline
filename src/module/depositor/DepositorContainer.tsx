import { Button } from 'antd';
import ModalDialog from '../common/Dialogs/ModalDialog';
import NewDeposit from './components/NewDeposit/NewDeposit';
import { useEffect, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/redux-hooks/redux-hooks';
import {
  updateCreateDepositState,
  updateDashboadardData,
} from './slice/depositSlice';
import TopNavigation from '../common/components/TopNavigation/TopNavigation';
import SideNavigation from '../common/components/SideNavigation/SideNavigation';
import { Outlet } from 'react-router-dom';

const DepositorContainer = () => {
  const {
    createDeposit: { status, data: depositData },
  } = useAppSelector((state) => state.DepositSlice);
  const [isOpenNewDeposit, setIsOpenNewDeposit] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === true) {
      setIsOpenNewDeposit(false);
      dispatch(updateCreateDepositState(false));

      //update dashboard data
      dispatch(
        updateDashboadardData({
          amount: depositData.amount,
        }),
      );
    }
  }, [status]);

  const handleClick = () => {
    setIsOpenNewDeposit(!isOpenNewDeposit);
  };
  return (
    <div className="h-full">
      <div className="md:hidden block">
        <TopNavigation />
      </div>

      {/** large device */}
      <div className="flex w-full h-full">
        <div className="fixed w-72 h-full hidden md:block">
          <SideNavigation />
        </div>

        <div className="md:ml-80 w-full h-full px-4">
          <div className="flex flex-col items-start justify-start px-1 w-full mt-2 gap-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-bold">Today's Deposit</span>
              <Button onClick={handleClick} color="primary" type="primary">
                New Deposit
              </Button>
            </div>
          </div>
          <div className="py-8 w-full">
            <Outlet />
          </div>
        </div>
      </div>
      <ModalDialog
        isOpen={isOpenNewDeposit}
        title={'New Deposit'}
        onCloseIcon={() => setIsOpenNewDeposit(false)}
      >
        <NewDeposit />
      </ModalDialog>
    </div>
  );
};

export default DepositorContainer;
