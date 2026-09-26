# Bingo Balance Issuer

Standalone Windows Tauri app for issuing signed offline balance credits to Bingo Desktop users.

## Run in development

From the repository root, run this single command. Tauri starts the Vite server automatically, with hot reload enabled:

```powershell
npm --prefix balance-issuer run tauri -- dev
```

## Build the Windows installer

```powershell
npm --prefix balance-issuer run tauri -- build --bundles nsis
```

The NSIS installer is written to `balance-issuer/src-tauri/target/release/bundle/nsis/`.

## How to issue balance

1. In the cashier app, the customer shows and sends you their device ID.
2. Enter that ID and the amount received in this app.
3. Copy the generated balance text and send it back to the customer.
4. The customer pastes it into the cashier app. The app checks the device, date, signature, and one-time credit ID before adding the balance.

The signing keys are configured by the app administrator at build time using `VITE_BALANCE_SIGNING_PUBLIC_KEY` and `VITE_BALANCE_ISSUER_PRIVATE_KEY`. Keep the private signing key secret and distribute this issuer app only to trusted balance operators. The device ID is inside the balance code but is not displayed as plain text. This app does not send data over the network.

For setup and run instructions for both desktop apps, see the repository [README](../README.md).
