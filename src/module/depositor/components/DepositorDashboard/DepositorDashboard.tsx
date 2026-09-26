import { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/redux-hooks/redux-hooks';
import { IDashboardReport } from '../../model/IDashboardReport';
import AdminCard from '../Card/AdminCard';
import {
  cashierDepositListAPI,
  changeDashboardData,
} from '../../slice/depositSlice';
import { meQuery } from '../../../common/slices/UserSlice';

const DepositorDashboard = () => {
  const {
    loading: meLoading,
    status: meStatus,
    data: user,
  } = useAppSelector((state) => state.UserSlice.user);
  const { dashboardData: dashboardCards } = useAppSelector(
    (state) => state.DepositSlice,
  );
  const {
    loading,
    status,
    data: depositList,
  } = useAppSelector((state) => state.DepositSlice.depositList);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(meQuery());
  }, []);
  useEffect(() => {
    if (meStatus && user) {
      dispatch(
        cashierDepositListAPI({
          userId: user.id, // Assuming user.id is the cashier ID, adjust as necessary
        }),
      );
    }
  }, [meStatus, user]);

  useEffect(() => {
    if (status) {
      const totalDeposit = depositList.reduce((acc, curr) => {
        return acc + curr.amount;
      }, 0);
      const numberOfDeposit = depositList.length;

      const transformedDashboardData = dashboardCards.map((data) => {
        if (data.id === 1) {
          return { ...data, data: numberOfDeposit };
        }
        if (data.id === 2) {
          return { ...data, data: totalDeposit };
        }
      });
      dispatch(changeDashboardData(transformedDashboardData));
    }
  }, [status]);

  if (loading) {
    return <span className="font-bold text-lg">Loading...</span>;
  }

  return (
    <div className="w-full flex md:flex-nowrap flex-wrap gap-4">
      {/**Card */}
      <div className="w-full">
        <div className="grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {dashboardCards.map((card: IDashboardReport) => (
            <AdminCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepositorDashboard;
