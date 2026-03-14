# Dashberry — RPi Parallel Development Setup

> Run and test the app directly on the Raspberry Pi during development, with
> fast code–deploy–test cycles driven from the Ubuntu workstation.

---

## Problem

Today the only way to run Dashberry on the RPi is the full **package → deploy** pipeline
(`npm run deploy-to-rpi`), which cross-compiles the .NET backend, builds the
Angular frontend, packages everything with electron-builder, and rsyncs the
result. This takes several minutes per iteration and makes real-time debugging
on the Pi impractical.

We need a lightweight **"dev mode on the RPi"** workflow that:

1. Syncs source code to the Pi quickly (seconds, not minutes).
2. Runs Angular dev server + .NET backend + Electron in dev mode on the Pi itself.
3. Allows the developer to edit on the Ubuntu workstation and see changes on the Pi
   almost immediately.
4. Does **not** replace the existing production build/deploy pipeline — it supplements it.

---

## Prerequisites (one-time Pi setup)

| What | Details |
|---|---|
| **Node.js 22 LTS** | Install via `nvm` (matches workstation `.nvmrc 22.12.0`). |
| **.NET 9 SDK** | `curl -sSL https://dot.net/v1/dotnet-install.sh \| bash /dev/stdin --channel 9.0` |
| **Electron deps** | `sudo apt install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libsecret-1-0` |
| **SSH key** | Passwordless SSH from workstation → `kruno@rpi` (already in use by `deploy-to-rpi`). |
| **Project dir** | `~/dashberry-dev/` on the Pi (separate from the production `~/dashberry/`). |

---

## Proposed Changes

### 1. Source sync script

#### [NEW] [sync-to-rpi.sh](file:///home/kruno/projects/dashberry/scripts/sync-to-rpi.sh)

A fast `rsync` that pushes only source files to the Pi, excluding build
artifacts, `node_modules`, and other heavy directories.

```bash
#!/usr/bin/env bash
# Syncs source code to the RPi for development.
# Usage: ./scripts/sync-to-rpi.sh [--watch]

RPI_HOST="${RPI_HOST:-kruno@rpi}"
RPI_DIR="${RPI_DIR:-~/dashberry-dev}"

EXCLUDES=(
  node_modules/ dist/ bin/ obj/ release/
  .angular/ .git/ backend/dist-backend/
  frontend/dist/ "*.log"
)

RSYNC_ARGS=(-avz --delete)
for ex in "${EXCLUDES[@]}"; do
  RSYNC_ARGS+=(--exclude "$ex")
done

rsync "${RSYNC_ARGS[@]}" ./ "${RPI_HOST}:${RPI_DIR}/"

if [[ "$1" == "--watch" ]]; then
  # Continuous sync using inotifywait
  echo "Watching for changes…"
  while inotifywait -r -e modify,create,delete,move \
    --exclude '(node_modules|dist|\.git|\.angular|bin|obj|release)' .; do
    rsync "${RSYNC_ARGS[@]}" ./ "${RPI_HOST}:${RPI_DIR}/"
  done
fi
```

Key points:
- Excludes all heavy/generated dirs → only source + configs travel over the wire.
- `--watch` mode uses `inotifywait` for continuous sync (requires `inotify-tools` on workstation).
- Env vars `RPI_HOST` / `RPI_DIR` are overridable.

---

### 2. Remote dev script (runs on the Pi)

#### [NEW] [rpi-dev.sh](file:///home/kruno/projects/dashberry/scripts/rpi-dev.sh)

Bootstraps the dev environment on the Pi and starts all three processes.

```bash
#!/usr/bin/env bash
# Run on the RPi after syncing source.
# Installs deps (if needed) and starts dev mode.
set -e

cd ~/dashberry-dev

# Install root deps
npm install

# Install frontend deps
(cd frontend && npm install)

# Restore .NET deps
(cd backend && dotnet restore)

# Start dev mode (Angular + .NET + Electron)
npm run dev
```

> [!NOTE]
> The first run will take longer due to `npm install` and `dotnet restore`.
> Subsequent runs skip unchanged deps automatically.

---

### 3. One-command "sync + run" from workstation

#### [NEW] [dev-rpi.sh](file:///home/kruno/projects/dashberry/scripts/dev-rpi.sh)

Combines sync + remote dev in a single command.

```bash
#!/usr/bin/env bash
# Sync source to RPi and start dev mode remotely.
# Usage: ./scripts/dev-rpi.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RPI_HOST="${RPI_HOST:-kruno@rpi}"
RPI_DIR="${RPI_DIR:-~/dashberry-dev}"

echo "==> Syncing source to ${RPI_HOST}:${RPI_DIR}…"
"$SCRIPT_DIR/sync-to-rpi.sh"

echo "==> Starting dev mode on RPi…"
ssh -t "$RPI_HOST" "cd ${RPI_DIR} && bash scripts/rpi-dev.sh"
```

---

### 4. npm scripts

#### [MODIFY] [package.json](file:///home/kruno/projects/dashberry/package.json)

Add convenience scripts:

```diff
   "deploy-to-rpi": "npm run package:arm64 && rsync -avz --delete release/linux-arm64-unpacked/ kruno@rpi:~/dashberry/"
+  ,
+  "sync-to-rpi": "bash scripts/sync-to-rpi.sh",
+  "sync-to-rpi:watch": "bash scripts/sync-to-rpi.sh --watch",
+  "dev:rpi": "bash scripts/dev-rpi.sh"
```

---

### 5. VS Code launch configuration

#### [MODIFY] [launch.json](file:///home/kruno/projects/dashberry/.vscode/launch.json)

Add a new launch config for the quick RPi dev workflow:

```jsonc
{
    "name": "Dev on RPi (Sync + Run)",
    "type": "node",
    "request": "launch",
    "runtimeExecutable": "/home/kruno/.nvm/versions/node/v22.12.0/bin/npm",
    "runtimeArgs": ["run", "dev:rpi"],
    "cwd": "${workspaceFolder}",
    "console": "integratedTerminal"
}
```

---

### 6. RPi first-time setup script

#### [NEW] [rpi-setup.sh](file:///home/kruno/projects/dashberry/scripts/rpi-setup.sh)

Automates the one-time prerequisite installation on the Pi.

```bash
#!/usr/bin/env bash
# Run ON the Raspberry Pi to install all dev prerequisites.
set -e

echo "==> Installing Electron system dependencies…"
sudo apt update
sudo apt install -y \
  libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 \
  xdg-utils libatspi2.0-0 libsecret-1-0

echo "==> Installing nvm + Node.js 22…"
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 22.12.0
nvm alias default 22.12.0

echo "==> Installing .NET 9 SDK…"
if ! command -v dotnet &>/dev/null; then
  curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 9.0
  echo 'export DOTNET_ROOT=$HOME/.dotnet' >> ~/.bashrc
  echo 'export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools' >> ~/.bashrc
fi

echo "==> Done! Re-open your terminal or run: source ~/.bashrc"
```

---

### 7. Documentation

#### [NEW] [rpi-development.md](file:///home/kruno/projects/dashberry/docs/rpi-development.md)

Developer guide covering:
- One-time Pi setup (running `rpi-setup.sh`).
- Daily workflow: `npm run dev:rpi` or `npm run sync-to-rpi:watch` + SSH.
- Troubleshooting (common issues like display env vars, port conflicts).
- Differences between dev mode and production deploy.

---

## Summary of new/modified files

| File | Action | Purpose |
|---|---|---|
| `scripts/sync-to-rpi.sh` | **NEW** | Fast rsync of source to Pi (with `--watch` mode) |
| `scripts/rpi-dev.sh` | **NEW** | Runs dev mode on the Pi |
| `scripts/dev-rpi.sh` | **NEW** | One-command sync + remote dev from workstation |
| `scripts/rpi-setup.sh` | **NEW** | One-time Pi prerequisites installer |
| `package.json` | **MODIFY** | Add `sync-to-rpi`, `sync-to-rpi:watch`, `dev:rpi` scripts |
| `.vscode/launch.json` | **MODIFY** | Add "Dev on RPi" launch config |
| `docs/rpi-development.md` | **NEW** | Developer guide for RPi workflow |

---

## User Review Required

> [!IMPORTANT]
> **`RPI_HOST` default**: The scripts default to `kruno@rpi`. Confirm this hostname resolves to your Pi (e.g., via `/etc/hosts` or mDNS `rpi.local`).

> [!IMPORTANT]
> **Dev directory on Pi**: Using `~/dashberry-dev/` to keep it separate from the production `~/dashberry/`. Let me know if you prefer a different path.

> [!IMPORTANT]
> **Electron on Pi in dev mode**: This requires the Pi to have a display server (X11/Wayland) running. The `--no-sandbox` flag is already present in the `dev:electron` script. Confirm you want the Electron window to render on the Pi's own display (`:0`), or if you'd prefer to use X11 forwarding over SSH to view it on your workstation.

---

## Verification Plan

### Automated checks (on workstation)

1. **Sync test** — Run `npm run sync-to-rpi` and verify files land in `~/dashberry-dev/` on the Pi:
   ```bash
   npm run sync-to-rpi
   ssh kruno@rpi "ls ~/dashberry-dev/package.json"
   ```
2. **Exclusion test** — Verify heavy dirs are NOT synced:
   ```bash
   ssh kruno@rpi "test -d ~/dashberry-dev/node_modules && echo FAIL || echo OK"
   ```

### Manual verification (requires RPi)

1. SSH into the Pi, run `bash ~/dashberry-dev/scripts/rpi-setup.sh`, confirm Node 22 + .NET 9 are installed.
2. From the workstation, run `npm run dev:rpi` — confirm Angular serves at `:4200`, .NET at `:5000`, and Electron window opens on the Pi's display.
3. Edit a file on the workstation, run `npm run sync-to-rpi`, then verify the change is reflected on the Pi.
