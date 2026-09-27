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

byId('copy-credit').addEventListener('click', () => copyText(signedCreditOutput.value, 'Balance text'));

byId('issue-credit').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  creditOutput.classList.add('hidden');
  try {
    const deviceId = deviceIdInput.value.trim();
    if (!deviceId) throw new Error('Enter the customer’s device ID.');
    const received = Number(amountInput.value);
    if (!Number.isFinite(received) || received <= 0) throw new Error('Enter an amount received greater than zero.');
    if (!issuerPrivateKey.trim()) throw new Error('This balance issuer is not configured. Contact your app administrator.');

    const amount = Math.round(received * 500) / 100;
    const commission = Math.round(amount * 20) / 100;
    const date = new Date().toISOString().slice(0, 10);
    const creditId = crypto.randomUUID();
    const payload = `${deviceId}\n${date}\n${creditId}\n${amount}`;
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
    const credit = { type: 'BINGO_BALANCE_CREDIT', deviceId, date, creditId, amount };
    const envelope = JSON.stringify({ credit, signature: toBase64Url(new Uint8Array(signature)) });
    signedCreditOutput.value = `BINGO1:${toBase64Url(encoder.encode(envelope))}`;
    issuedCommission.textContent = `${commission.toFixed(2)} ETB (20%)`;
    issuedCreditAmount.textContent = `${amount.toFixed(2)} ETB`;
    creditOutput.classList.remove('hidden');
    showStatus('Balance text is ready. Copy it and send it to the customer.', 'success');
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Could not issue signed balance text.');
  } finally {
    button.disabled = false;
  }
});
