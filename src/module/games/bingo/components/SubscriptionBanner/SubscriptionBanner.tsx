import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'antd';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import { getOfflineAccountId } from '../../../../../config/db/services/OfflineBingoService';
import {
  formatExpiry,
  getSubscriptionStatus,
  SUBSCRIPTION_WARNING_DAYS,
  type SubscriptionStatus,
} from '../../../../../config/db/services/SubscriptionService';

const REFRESH_INTERVAL_MS = 60 * 1000;
const notifiedKey = (accountId: number) => `subscription-notified-${accountId}`;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function reminderText(status: SubscriptionStatus): string {
  if (!status.isActive) {
    return `Your monthly subscription expired on ${formatExpiry(status.expiresAt)}. Renew it from Dashboard > Balance to start new games.`;
  }
  const days = status.daysLeft === 1 ? '1 day' : `${status.daysLeft} days`;
  return `Your monthly subscription ends in ${days} (${formatExpiry(status.expiresAt)}). Renew it from Dashboard > Balance.`;
}

/** Sends the Windows reminder at most once a day per account. */
async function notifyOncePerDay(accountId: number, status: SubscriptionStatus): Promise<void> {
  try {
    if (localStorage.getItem(notifiedKey(accountId)) === todayKey()) return;
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === 'granted';
    if (!granted) return;
    sendNotification({
      title: status.isActive ? 'Bingo subscription ending soon' : 'Bingo subscription expired',
      body: reminderText(status),
    });
    localStorage.setItem(notifiedKey(accountId), todayKey());
  } catch {
    // The in-app banner still shows the reminder if notifications are unavailable.
  }
}

/** Shows the subscription reminder when 5 or fewer days remain, or after it expires. */
const SubscriptionBanner = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const accountId = getOfflineAccountId();

  const refresh = useCallback(async () => {
    if (!accountId) return;
    try {
      const next = await getSubscriptionStatus(accountId);
      setStatus(next);
      if (next.hasSubscription && next.daysLeft <= SUBSCRIPTION_WARNING_DAYS) {
        await notifyOncePerDay(accountId, next);
      }
    } catch {
      setStatus(null);
    }
  }, [accountId]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    window.addEventListener('offline-balance-updated', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('offline-balance-updated', refresh);
    };
  }, [refresh]);

  if (!status?.hasSubscription || status.daysLeft > SUBSCRIPTION_WARNING_DAYS) return null;

  return (
    <Alert
      className="w-full"
      type={status.isActive ? 'warning' : 'error'}
      showIcon
      banner
      message={reminderText(status)}
    />
  );
};

export default SubscriptionBanner;
