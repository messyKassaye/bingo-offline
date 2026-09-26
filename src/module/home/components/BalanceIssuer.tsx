import { useState } from 'react';
import { Alert, Button, Input, InputNumber, message } from 'antd';

type Props = { onBack?: () => void };

type BalanceRequest = { deviceId: string; date: string };

const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function toPem(label: string, bytes: Uint8Array): string {
  const base64 = bytesToBase64(bytes);
  const lines = base64.match(/.{1,64}/g)?.join('\n') ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function fromPem(pem: string): Uint8Array<ArrayBuffer> {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----|-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isValidRequestDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return false;
  }
  const age = (Date.now() - parsed.getTime()) / 86_400_000;
  return age >= 0 && age <= 30;
}

const BalanceIssuer = ({ onBack }: Props) => {
  const [requestText, setRequestText] = useState('');
  const [amountReceived, setAmountReceived] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [creditText, setCreditText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const generateKeyPair = async () => {
    setBusy(true);
    setError('');
    try {
      const pair = await crypto.subtle.generateKey(
        { name: 'RSA-PSS', modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['sign', 'verify'],
      );
      const [privateBytes, publicBytes] = await Promise.all([
        crypto.subtle.exportKey('pkcs8', pair.privateKey),
        crypto.subtle.exportKey('spki', pair.publicKey),
      ]);
      setPrivateKey(toPem('PRIVATE KEY', new Uint8Array(privateBytes)));
      setPublicKey(toPem('PUBLIC KEY', new Uint8Array(publicBytes)));
      setCreditText('');
      message.success('New signing key pair generated. Keep the private key safe.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate keys.');
    } finally {
      setBusy(false);
    }
  };

  const issueCredit = async () => {
    setBusy(true);
    setError('');
    try {
      const request = JSON.parse(requestText) as Partial<BalanceRequest>;
      if (
        typeof request.deviceId !== 'string' ||
        !request.deviceId.trim() ||
        typeof request.date !== 'string' ||
        !isValidRequestDate(request.date)
      ) {
        throw new Error('Request text must contain a valid deviceId and date from the last 30 days.');
      }
      if (!Number.isFinite(amountReceived) || !amountReceived || amountReceived <= 0) {
        throw new Error('Enter the amount received from the customer.');
      }
      if (!privateKey.trim()) throw new Error('Paste the issuer RSA private key.');

      const amount = Math.round(amountReceived * 5 * 100) / 100;
      const creditId = crypto.randomUUID();
      const payload = `${request.deviceId}\n${request.date}\n${creditId}\n${amount}`;
      const signingKey = await crypto.subtle.importKey(
        'pkcs8',
        fromPem(privateKey),
        { name: 'RSA-PSS', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const signature = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        signingKey,
        encoder.encode(payload),
      );
      setCreditText(
        JSON.stringify(
          {
            type: 'BINGO_BALANCE_CREDIT',
            deviceId: request.deviceId,
            date: request.date,
            creditId,
            amount,
            signature: bytesToBase64(new Uint8Array(signature)),
          },
          null,
          2,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not issue signed balance text.',
      );
      setCreditText('');
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      message.success(`${label} copied.`);
    } catch {
      message.error(`Could not copy ${label.toLowerCase()}; select and copy it manually.`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full p-6">
      <div className="flex flex-col gap-3 w-full max-w-2xl">
        <h2 className="text-2xl font-bold">Offline balance issuer</h2>
        <p>Enter the amount received. The customer receives five times that amount as balance credit.</p>
        <Alert type="warning" showIcon message="Keep the RSA private key only on the trusted issuer desktop. Configure the matching public key in the cashier app." />
        {error && <Alert type="error" showIcon message={error} />}

        <Button loading={busy} onClick={generateKeyPair}>Generate signing key pair</Button>
        {publicKey && (
          <>
            <label className="font-semibold">Public key — configure this in the cashier app</label>
            <Input.TextArea value={publicKey} readOnly autoSize={{ minRows: 3, maxRows: 7 }} />
            <Button onClick={() => copyText(publicKey, 'Public key')}>Copy public key</Button>
          </>
        )}

        <label className="font-semibold" htmlFor="issuer-private-key">Issuer private key (PKCS#8 PEM)</label>
        <Input.TextArea
          id="issuer-private-key"
          value={privateKey}
          onChange={(event) => setPrivateKey(event.target.value)}
          placeholder="Paste the trusted issuer private key"
          autoSize={{ minRows: 4, maxRows: 9 }}
        />
        {privateKey && (
          <Button onClick={() => copyText(privateKey, 'Private key')}>
            Copy private key for secure backup
          </Button>
        )}
        <label className="font-semibold" htmlFor="balance-request">Customer request text</label>
        <Input.TextArea
          id="balance-request"
          value={requestText}
          onChange={(event) => setRequestText(event.target.value)}
          placeholder="Paste the device ID and date request"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
        <label className="font-semibold">Amount received</label>
        <InputNumber
          min={0.01}
          precision={2}
          value={amountReceived}
          onChange={setAmountReceived}
          className="w-full"
          placeholder="For example, 200"
        />
        {amountReceived !== null && amountReceived > 0 && (
          <span>Balance credit to issue: <strong>{(Math.round(amountReceived * 500) / 100).toFixed(2)}</strong></span>
        )}
        <Button type="primary" loading={busy} onClick={issueCredit}>Generate signed balance text</Button>
        {creditText && (
          <>
            <label className="font-semibold">Signed balance text</label>
            <Input.TextArea value={creditText} readOnly autoSize={{ minRows: 5, maxRows: 10 }} />
            <Button onClick={() => copyText(creditText, 'Balance text')}>Copy balance text</Button>
          </>
        )}
        {onBack && <Button type="link" onClick={onBack}>Back to dashboard</Button>}
      </div>
    </div>
  );
};

export default BalanceIssuer;
