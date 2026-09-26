import { useCallback, useEffect, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import {
  bingoCashierDashboardAPI,
  meQuery,
} from '../../../../common/slices/UserSlice';
import { Alert, Avatar, Button, Divider, Tabs } from 'antd';
import { Icon } from '@iconify/react';
import BingoDashboardCard from '../BingoDashboardCard/BingoDashboardCard';
import { LOCAL_SESSION } from '../../../../../constants/constants';
import { isTauri } from '@tauri-apps/api/core';
import OfflineBalance from '../OfflineBalance/OfflineBalance';
import { getOfflineDashboardSummary, type OfflineDashboardSummary } from '../../../../../config/db/services/OfflineBingoService';

type Props = {
  onBackToGame: () => void;
};
const BingoDashboard = ({ onBackToGame }: Props) => {
  const { loading: dashboarLoading, data: dashboardData } = useAppSelector(
    (state) => state.UserSlice.cashierDashboard,
  );
  const {
    loading: meLoaidng,
    data: { username, name },
  } = useAppSelector((state) => state.UserSlice.user);
  const dispatch = useAppDispatch();
  const [offlineSummary, setOfflineSummary] = useState<OfflineDashboardSummary | null>(null);
  const [offlineSummaryError, setOfflineSummaryError] = useState('');
  const offlineSession = isTauri() ? localStorage.getItem(LOCAL_SESSION) : null;
  const offlineAccount = offlineSession
    ? (JSON.parse(offlineSession) as { id: number; shopName: string; username: string })
    : null;

  const refreshOfflineSummary = useCallback(async () => {
    if (!offlineAccount) return;
    try {
      setOfflineSummary(await getOfflineDashboardSummary(offlineAccount.id));
      setOfflineSummaryError('');
    } catch (cause) {
      setOfflineSummaryError(cause instanceof Error ? cause.message : 'Could not load today’s totals.');
    }
  }, [offlineAccount?.id]);

  useEffect(() => {
    if (!offlineAccount) return;
    void refreshOfflineSummary();
    const interval = window.setInterval(() => void refreshOfflineSummary(), 5000);
    const handleBalanceUpdated = () => void refreshOfflineSummary();
    window.addEventListener('offline-balance-updated', handleBalanceUpdated);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('offline-balance-updated', handleBalanceUpdated);
    };
  }, [offlineAccount?.id, refreshOfflineSummary]);

  useEffect(() => {
    if (offlineSession) return;
    dispatch(meQuery());
  }, [dispatch, offlineSession]);

  useEffect(() => {
    if (offlineSession) return;
    dispatch(bingoCashierDashboardAPI());
  }, [dispatch, offlineSession]);

  const onLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const loading = !offlineSession && meLoaidng && dashboarLoading;

  if (loading) {
    return <span>Loading...</span>;
  }

  return (
    <div className="flex items-start justify-start gap-8 h-full min-h-0 overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col items-center justify-center w-[150px] shrink-0 gap-4">
        <Avatar
          size={'large'}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'orange',
            color: 'white',
            fontSize: '30px',
          }}
        >
          {(offlineAccount?.shopName || name)?.charAt(0).toUpperCase()}
        </Avatar>
        {(offlineAccount?.username || username) && (
          <span className="font-bold text-lg">{offlineAccount?.username || username}</span>
        )}
        <div className="flex flex-col items-start justify-start w-full gap-2 mt-5">
          <Button
            onClick={onBackToGame}
            type="text"
            className="p-3"
            icon={<Icon icon={'mingcute:game-2-fill'} fontSize={28} />}
          >
            Back to game
          </Button>
          <Button
            onClick={onLogout}
            type="text"
            className="p-3"
            icon={<Icon icon={'material-symbols:logout'} fontSize={28} />}
          >
            Log out
          </Button>
        </div>
      </div>
      <Divider
        type="vertical"
        style={{ height: '100%', margin: '0 16px', overflow: 'hidden' }}
      />

      <div className="flex min-w-0 flex-1 flex-col items-start justify-start">
        <span className="font-bold text-lg">Dashboard</span>
        {offlineSession ? (
          <Tabs
            className="mt-3 w-full min-w-0"
            items={[
              {
                key: 'dashboard',
                label: 'Dashboard',
                children: (
                  <div className="mt-3 flex flex-col gap-4">
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <BingoDashboardCard
                        bgColor="#D0BCBC"
                        title="Money Worked Today"
                        value={offlineSummary?.totalCollectedMoney ?? 0}
                        isShowCurrency
                      />
                      <BingoDashboardCard
                        bgColor="#BFCDC0"
                        title="Balance Used Today Net"
                        value={offlineSummary?.totalPayIn ?? 0}
                        isShowCurrency
                      />
                      <BingoDashboardCard
                        bgColor="#DCD7AB"
                        title="Games Today"
                        value={offlineSummary?.totalGame ?? 0}
                        isShowCurrency={false}
                      />
                      <BingoDashboardCard
                        bgColor="#C7D5E5"
                        title="Balance Left"
                        value={offlineSummary?.totalBalance ?? 0}
                        isShowCurrency
                      />
                    </div>
                    {offlineSummaryError && <Alert type="error" showIcon message={offlineSummaryError} />}
                    <p className="text-sm text-gray-600">Today’s totals update automatically. Money worked includes completed games and the currently selected cartellas.</p>
                  </div>
                ),
              },
              {
                key: 'balance',
                label: 'Balance',
                children: <div className="mt-3 w-full max-w-2xl"><OfflineBalance /></div>,
              },
            ]}
          />
        ) : dashboardData && (
          <div className="grid grid-cols-4 gap-3 mt-5">
            <BingoDashboardCard
              bgColor="#D0BCBC"
              title="Total Income"
              value={dashboardData?.totalCollectedMoney}
              isShowCurrency
            />

            <BingoDashboardCard
              bgColor="#BFCDC0"
              title="Total Cut"
              value={Math.round(dashboardData?.totalPayIn)}
              isShowCurrency
            />

            <BingoDashboardCard
              bgColor="#DCD7AB"
              title="Total Games"
              value={dashboardData.totalGame}
              isShowCurrency={false}
            />

            <BingoDashboardCard
              bgColor="#D0BCBC"
              title="Deposit Balance"
              value={dashboardData.totalBalance}
              isShowCurrency
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoDashboard;
