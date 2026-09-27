import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
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
import {
  getOfflineDashboardSummary,
  getOfflineShop,
  replaceOfflineCartellas,
  type OfflineDashboardSummary,
} from '../../../../../config/db/services/OfflineBingoService';
import { getCashierBingoShopAPI } from '../../slices/BingoShopSlice';
import type { IBingoCard } from '../../model/IBingoCard';
import '../AgentCartella/_CartellaCard.scss';
import '../AgentCartella/_GridStyle.scss';

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
  const [offlineCards, setOfflineCards] = useState<IBingoCard[] | null>(null);
  const [offlineCardsError, setOfflineCardsError] = useState('');
  const [offlineCardsMessage, setOfflineCardsMessage] = useState('');
  const [isImportingCartellas, setIsImportingCartellas] = useState(false);
  const cartellaFileInput = useRef<HTMLInputElement>(null);
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

  const loadOfflineCards = useCallback(async () => {
    if (!offlineAccount) return;
    try {
      const shop = await getOfflineShop(offlineAccount.id);
      setOfflineCards(shop.agentShop.company?.cards ?? shop.agentShop.cards ?? []);
      setOfflineCardsError('');
    } catch (cause) {
      setOfflineCardsError(cause instanceof Error ? cause.message : 'Could not load cartellas.');
    }
  }, [offlineAccount?.id]);

  const handleCartellaPdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !offlineAccount) return;
    setIsImportingCartellas(true);
    setOfflineCardsError('');
    setOfflineCardsMessage('');
    try {
      const { extractCartellasFromPdf } = await import('../../utils/extractCartellasFromPdf');
      const cards = await extractCartellasFromPdf(file);
      await replaceOfflineCartellas(offlineAccount.id, cards);
      setOfflineCards(cards);
      setOfflineCardsMessage(`${cards.length} cartellas imported and saved on this device.`);
      await dispatch(getCashierBingoShopAPI());
    } catch (cause) {
      setOfflineCardsError(cause instanceof Error ? cause.message : 'Could not extract cartellas from this PDF.');
    } finally {
      setIsImportingCartellas(false);
    }
  };

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
            onChange={(key) => { if (key === 'cartella' && offlineCards === null) void loadOfflineCards(); }}
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
                        title="Balance Used Today Net (20%)"
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
              {
                key: 'cartella',
                label: 'Cartella',
                children: (
                  <div className="mt-3 flex min-w-0 flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">Your cartellas</h2>
                        <p className="text-sm text-gray-600">{offlineCards === null ? 'Loading your saved cartellas…' : `${offlineCards.length} cartellas saved on this device.`}</p>
                      </div>
                      <div>
                        <input
                          ref={cartellaFileInput}
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={handleCartellaPdfUpload}
                        />
                        <Button
                          type="primary"
                          loading={isImportingCartellas}
                          onClick={() => cartellaFileInput.current?.click()}
                          icon={<Icon icon="ic:round-upload" fontSize={20} />}
                        >
                          Upload cartella PDF
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Upload a PDF exported from the admin Cartella page. The imported cards replace the saved cartellas.</p>
                    {offlineCardsError && <Alert type="error" showIcon message={offlineCardsError} />}
                    {offlineCardsMessage && <Alert type="success" showIcon message={offlineCardsMessage} />}
                    {offlineCards && offlineCards.length > 0 ? (
                      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {offlineCards.map((card, index) => (
                          <div key={index} className="min-w-0">
                            <ReadOnlyCartella card={card} cardNumber={index + 1} />
                          </div>
                        ))}
                      </div>
                    ) : offlineCards?.length === 0 ? (
                      <Alert type="info" showIcon message="No cartellas are saved for this shop." />
                    ) : null}
                  </div>
                ),
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

const ReadOnlyCartella = ({ card, cardNumber }: { card: IBingoCard; cardNumber: number }) => (
  <div className="print-bingo-card-container">
    <div className="print-bingo-card-grid">
      <div className="print-bingo-row">
        {(['B', 'I', 'N', 'G', 'O'] as const).map((column) => <div key={column} className="print-bingo-header">{column}</div>)}
      </div>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="print-bingo-row">
          {(['B', 'I', 'N', 'G', 'O'] as const).map((column) => {
            const value = card[column][row];
            return <div key={column} className={`print-bingo-card-ceils${column === 'N' && value === 'FREE' ? ' bingo-card-free-space h-full text-center' : ''}`}>{value}</div>;
          })}
        </div>
      ))}
    </div>
    <div className="cartella-footer"><span>Card No.</span><span>{cardNumber}</span></div>
  </div>
);

export default BingoDashboard;
