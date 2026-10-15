import './style.css';

const encoder = new TextEncoder();
const byId = (id) => document.getElementById(id);
const issuerPrivateKey = __ISSUER_PRIVATE_KEY__;

const deviceIdInput = byId('device-id');
const amountInput = byId('amount-received');
const commissionAmount = byId('commission-amount');
const creditAmount = byId('credit-amount');
const creditOutput = byId('credit-output');
const signedCreditOutput = byId('signed-credit');
const issuedCommission = byId('issued-commission');
const issuedCreditAmount = byId('issued-credit-amount');
const status = byId('status');
const monthsInput = byId('subscription-months');
const subscriptionDays = byId('subscription-days');
const issueButton = byId('issue-credit');
const DAYS_PER_MONTH = 30;

const getMode = () => document.querySelector('input[name="issue-mode"]:checked').value;

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function toPem(label, bytes) {
  const base64 = bytesToBase64(bytes);
  const lines = base64.match(/.{1,64}/g)?.join('\n') ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function fromPem(pem) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----|-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function showStatus(text, kind = 'error') {
  status.textContent = text;
  status.className = `status status-${kind}`;
}

async function copyText(value, label) {
  try {
    await navigator.clipboard.writeText(value);
    showStatus(`${label} copied to clipboard.`, 'success');
  } catch {
    showStatus(`Copy failed. Select and copy the ${label.toLowerCase()} manually.`, 'error');
  }
}

amountInput.addEventListener('input', () => {
  const received = Number(amountInput.value);
  const commission = Number.isFinite(received) && received > 0 ? Math.round(received * 100) / 100 : 0;
  const credit = Math.round(commission * 5 * 100) / 100;
  commissionAmount.textContent = `${commission.toFixed(2)} ETB`;
  creditAmount.textContent = `${credit.toFixed(2)} ETB`;
  creditOutput.classList.add('hidden');
});

document.querySelectorAll('input[name="issue-mode"]').forEach((input) => {
  input.addEventListener('change', () => {
    const isSubscription = getMode() === 'subscription';
    byId('subscription-fields').classList.toggle('hidden', !isSubscription);
    byId('credit-fields').classList.toggle('hidden', isSubscription);
    issueButton.textContent = isSubscription ? 'Generate subscription text' : 'Generate balance text';
    creditOutput.classList.add('hidden');
    status.className = 'status hidden';
  });
});

monthsInput.addEventListener('input', () => {
  const months = Number(monthsInput.value);
  subscriptionDays.textContent = Number.isInteger(months) && months > 0 ? `${months * DAYS_PER_MONTH} days` : '0 days';
  creditOutput.classList.add('hidden');
});

async function signPayload(payload) {
  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    fromPem(issuerPrivateKey),
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    signingKey,
    encoder.encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
}

function showIssuedText(envelope) {
  signedCreditOutput.value = `BINGO1:${toBase64Url(encoder.encode(JSON.stringify(envelope)))}`;
  creditOutput.classList.remove('hidden');
}

async function issueSubscription(deviceId) {
  const months = Number(monthsInput.value);
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new Error('Enter between 1 and 12 months.');
  const days = months * DAYS_PER_MONTH;
  const date = new Date().toISOString().slice(0, 10);
  const subscriptionId = crypto.randomUUID();
  const signature = await signPayload(`BINGO_SUBSCRIPTION\n${deviceId}\n${date}\n${subscriptionId}\n${days}`);
  const subscription = { type: 'BINGO_SUBSCRIPTION', deviceId, date, subscriptionId, days };
  showIssuedText({ subscription, signature });
  byId('issued-credit').classList.add('hidden');
  byId('issued-subscription').classList.remove('hidden');
  byId('issued-subscription-days').textContent = `${months} ${months === 1 ? 'month' : 'months'} (${days} days)`;
  showStatus('Subscription text is ready. Copy it and send it to the customer.', 'success');
}

async function issueCredit(deviceId) {
  const received = Number(amountInput.value);
  if (!Number.isFinite(received) || received <= 0) throw new Error('Enter an amount received greater than zero.');
  const amount = Math.round(received * 500) / 100;
  const commission = Math.round(amount * 20) / 100;
  const date = new Date().toISOString().slice(0, 10);
  const creditId = crypto.randomUUID();
  const signature = await signPayload(`${deviceId}\n${date}\n${creditId}\n${amount}`);
  const credit = { type: 'BINGO_BALANCE_CREDIT', deviceId, date, creditId, amount };
  showIssuedText({ credit, signature });
  byId('issued-credit').classList.remove('hidden');
  byId('issued-subscription').classList.add('hidden');
  issuedCommission.textContent = `${commission.toFixed(2)} ETB (20%)`;
  issuedCreditAmount.textContent = `${amount.toFixed(2)} ETB`;
  showStatus('Balance text is ready. Copy it and send it to the customer.', 'success');
}

byId('copy-credit').addEventListener('click', () => copyText(signedCreditOutput.value, 'Text'));

issueButton.addEventListener('click', async () => {
  issueButton.disabled = true;
  creditOutput.classList.add('hidden');
  try {
    const deviceId = deviceIdInput.value.trim();
    if (!deviceId) throw new Error('Enter the customer’s device ID.');
    if (!issuerPrivateKey.trim()) throw new Error('This balance issuer is not configured. Contact your app administrator.');
    if (getMode() === 'subscription') await issueSubscription(deviceId);
    else await issueCredit(deviceId);
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Could not issue signed text.');
  } finally {
    issueButton.disabled = false;
  }
});
