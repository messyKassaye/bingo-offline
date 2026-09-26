import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Input, message } from 'antd';
import { BALANCE_SIGNING_PUBLIC_KEY, LOCAL_SESSION } from '../../../../../constants/constants';
import { useAppDispatch } from '../../../../../store/redux-hooks/redux-hooks';
import {
  applySignedBalanceCredit,
  createBalanceRequestText,
} from '../../../../../config/db/services/CashierShopCache';
import { getOfflineDashboardSummary } from '../../../../../config/db/services/OfflineBingoService';
import { getCashierBingoShopDepositAPI } from '../../slices/BingoShopSlice';

type LocalSession = { id: number };

const getAccount = (): LocalSession => {
  const session = localStorage.getItem(LOCAL_SESSION);
  if (!session) throw new Error('Please sign in to the offline account again.');
  return JSON.parse(session) as LocalSession;
};

const OfflineBalance = () => {
  const [requestText, setRequestText] = useState('');
  const [balanceText, setBalanceText] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const refreshBalance = useCallback(async () => {
    const account = getAccount();
    const summary = await getOfflineDashboardSummary(account.id);
    setBalance(summary.totalBalance);
  }, []);

  useEffect(() => {
    void refreshBalance().catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Could not load balance.');
    });
    const interval = window.setInterval(() => {
      void refreshBalance().catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Could not load balance.');
      });
    }, 5000);
    return () => window.clearInterval(interval);
  }, [refreshBalance]);

  const generateRequest = async () => {
    setBusy(true);
    setError('');
    try {
      setRequestText(await createBalanceRequestText());
      await refreshBalance();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load balance.');
    } finally {
      setBusy(false);
    }
  };

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(requestText);
      message.success('Request text copied.');
    } catch {
      message.error('Copy failed. Select and copy the request text.');
    }
  };

  const uploadCredit = async () => {
    setBusy(true);
    setError('');
    try {
      const account = getAccount();
      const newBalance = await applySignedBalanceCredit(
        balanceText,
        account.id,
        BALANCE_SIGNING_PUBLIC_KEY,
      );
      setBalance(newBalance);
      setBalanceText('');
      await refreshBalance();
      await dispatch(getCashierBingoShopDepositAPI());
      window.dispatchEvent(new Event('offline-balance-updated'));
      message.success('Signed credit added to this account.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not apply credit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 min-w-[280px] max-w-[600px]">
      <h3 className="font-bold text-lg">Offline balance</h3>
      {balance !== null && <div>Balance after current game commission: <strong>{balance.toLocaleString()} Br</strong></div>}
      {!BALANCE_SIGNING_PUBLIC_KEY.trim() && (
        <Alert type="warning" showIcon message="Balance verification key is not configured yet." />
      )}
      {error && <Alert type="error" showIcon message={error} />}
      <Button loading={busy} onClick={generateRequest}>Show device ID for balance</Button>
      {requestText && (
        <>
          <label className="font-semibold" htmlFor="balance-device-id">Give this device ID to the issuer</label>
          <Input id="balance-device-id" value={requestText} readOnly />
          <Button onClick={copyRequest}>Copy device ID</Button>
        </>
      )}
      <label className="font-semibold" htmlFor="signed-balance-text">Paste the balance text from the issuer</label>
      <Input.TextArea
        id="signed-balance-text"
        value={balanceText}
        onChange={(event) => setBalanceText(event.target.value)}
        placeholder="Paste the balance text you received"
        autoSize={{ minRows: 4, maxRows: 8 }}
      />
      <Button type="primary" loading={busy} disabled={!balanceText.trim()} onClick={uploadCredit}>
        Add balance
      </Button>
    </section>
  );
};

export default OfflineBalance;
