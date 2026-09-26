# Bingo Desktop Apps

This repository contains two separate Windows desktop apps:

- **Bingo Desktop** — the offline bingo game and shop dashboard.
- **Bingo Balance Issuer** — a staff app that creates signed balance text for Bingo Desktop.

## Requirements

- Node.js and npm
- Rust
- Windows desktop build tools required by Tauri

Install the JavaScript dependencies once, from this folder:

```powershell
npm install
```

## Configure balance signing keys

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Set these values in `.env` before building apps that issue or verify balance text:

- `VITE_BALANCE_SIGNING_PUBLIC_KEY` — public key used by Bingo Desktop to verify balance text.
- `VITE_BALANCE_ISSUER_PRIVATE_KEY` — private key used by the issuer app to sign balance text.

The two keys must belong to the same RSA key pair. Keep the private key secret and give the Balance Issuer only to trusted staff. `.env` is ignored by Git; do not commit it.

## Run Bingo Desktop with hot reload

From this repository folder, run:

```powershell
npm run tauri -- dev
```

This starts the Tauri desktop window and its Vite development server. Frontend changes hot reload in the window. Stop it with `Ctrl+C` in the terminal.

## Run Bingo Balance Issuer with hot reload

From this repository folder, run:

```powershell
npm --prefix balance-issuer run tauri -- dev
```

This starts the separate issuer Tauri window and its Vite development server. Frontend changes hot reload in the window. Stop it with `Ctrl+C` in the terminal.

## Build both Windows installers

Open PowerShell in the repository root. Install dependencies and configure `.env` first if this is a fresh checkout. Then run both build commands:

```powershell
# Bingo Desktop
npm exec tauri build -- --bundles nsis

# Bingo Balance Issuer
npm --prefix balance-issuer run tauri -- build --bundles nsis
```

Each command builds its Tauri app and creates a Windows installer. The output files are:

```text
src-tauri/target/release/bundle/nsis/Bingo Desktop_0.1.0_x64-setup.exe
```

```text
balance-issuer/src-tauri/target/release/bundle/nsis/Bingo Balance Issuer_0.1.0_x64-setup.exe
```

Build each app with the same signing key pair so the issuer's balance text can be verified by Bingo Desktop.

For the issuer workflow and operator instructions, see [balance-issuer/README.md](balance-issuer/README.md).
