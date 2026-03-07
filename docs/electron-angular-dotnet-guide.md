Saved at path
  Relative: docs/electron-angular-dotnet-guide.md
  Absolute: /home/kruno/projects/dashberry/docs/electron-angular-dotnet-guide.md
al, sans-serif; background: #f4f6f9; color: #2d3748; } header { background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); color: white; padding: 40px 48px; } header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; } header p { font-size: 1rem; color: #a0aec0; } .badge { display: inline-block; background: #4299e1; color: white; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; margin-right: 6px; margin-top: 12px; letter-spacing: 0.5px; } .badge.green { background: #48bb78; } .badge.purple { background: #9f7aea; } .container { max-width: 960px; margin: 0 auto; padding: 40px 24px; } h2 { font-size: 1.35rem; font-weight: 700; color: #1a202c; margin-bottom: 14px; margin-top: 40px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; } h2:first-of-type { margin-top: 0; } h3 { font-size: 1rem; font-weight: 700; color: #2d3748; margin: 20px 0 8px; } p { font-size: 0.95rem; line-height: 1.7; margin-bottom: 10px; color: #4a5568; } /\* Architecture box \*/ .arch-box { background: #1a202c; color: #e2e8f0; border-radius: 10px; padding: 28px 32px; font-family: 'Courier New', monospace; font-size: 0.88rem; line-height: 1.9; margin: 20px 0; overflow-x: auto; } .arch-box .comment { color: #68d391; } .arch-box .arrow { color: #63b3ed; } .arch-box .label { color: #f6ad55; font-weight: bold; } .arch-box .dim { color: #718096; } /\* File tree \*/ .tree { background: #1a202c; color: #e2e8f0; border-radius: 10px; padding: 24px 28px; font-family: 'Courier New', monospace; font-size: 0.85rem; line-height: 2; margin: 16px 0; overflow-x: auto; } .tree .folder { color: #f6ad55; font-weight: bold; } .tree .file { color: #90cdf4; } .tree .note { color: #68d391; font-style: italic; } /\* Code blocks \*/ pre { background: #1a202c; color: #e2e8f0; border-radius: 8px; padding: 18px 22px; font-size: 0.84rem; line-height: 1.7; margin: 12px 0 18px; overflow-x: auto; } pre .comment { color: #68d391; } pre .key { color: #f6ad55; } pre .str { color: #fc8181; } pre .kw { color: #9f7aea; } /\* Step cards \*/ .steps { display: flex; flex-direction: column; gap: 16px; margin: 20px 0; } .step { display: flex; gap: 18px; background: white; border-radius: 10px; padding: 20px 22px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07); border-left: 4px solid #4299e1; } .step.green { border-left-color: #48bb78; } .step.purple { border-left-color: #9f7aea; } .step.orange { border-left-color: #ed8936; } .step-num { font-size: 1.4rem; font-weight: 800; color: #4299e1; min-width: 28px; line-height: 1; margin-top: 2px; } .step.green .step-num { color: #48bb78; } .step.purple .step-num { color: #9f7aea; } .step.orange .step-num { color: #ed8936; } .step-content h4 { font-size: 0.97rem; font-weight: 700; color: #1a202c; margin-bottom: 4px; } .step-content p { margin: 0; font-size: 0.9rem; } /\* Info cards \*/ .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 18px 0; } .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07); } .card h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; } .card ul { padding-left: 18px; font-size: 0.88rem; color: #4a5568; line-height: 1.9; } /\* Workflow diagram \*/ .workflow { display: flex; align-items: center; gap: 0; margin: 20px 0; flex-wrap: wrap; gap: 4px; } .wf-box { background: white; border: 2px solid #bee3f8; border-radius: 8px; padding: 12px 18px; font-size: 0.88rem; font-weight: 600; color: #2b6cb0; text-align: center; } .wf-arrow { font-size: 1.4rem; color: #4299e1; padding: 0 4px; } .note-box { background: #ebf8ff; border-left: 4px solid #4299e1; border-radius: 0 8px 8px 0; padding: 14px 18px; font-size: 0.9rem; color: #2c5282; margin: 16px 0; } .warn-box { background: #fffaf0; border-left: 4px solid #ed8936; border-radius: 0 8px 8px 0; padding: 14px 18px; font-size: 0.9rem; color: #7b341e; margin: 16px 0; } @media (max-width: 640px) { .cards { grid-template-columns: 1fr; } header { padding: 28px 20px; } .container { padding: 28px 16px; } }

Electron + Angular + ASP.NET Core
=================================

Desktop Dashboard — Project Structure & Workflow Guide

Ubuntu AMD64 Dev Raspberry Pi Deploy No Docker Required

🏗️ Architecture Overview
-------------------------

Three layers, each doing what it does best:

┌─────────────────────────────────────────────────────┐  
│ YOUR DESKTOP APP │  
├─────────────────────────────────────────────────────┤  
│ Angular (UI, charts, tables, dashboard widgets) │  
│ Electron (wraps Angular in a desktop window) │  
│ ↕ HTTP/WebSocket (localhost only) │  
│ ASP.NET Core (API, business logic, data access) │  
├─────────────────────────────────────────────────────┤  
│ Runs on: Ubuntu AMD64 · Raspberry Pi 4/5 ARM64 │  
└─────────────────────────────────────────────────────┘

#### 🅰️ Angular (Frontend)

*   Dashboard UI & widgets
*   Charts (NgRx, Chart.js, etc.)
*   Calls .NET API via HTTP
*   You already know this ✅

#### ⚡ Electron (Shell)

*   Wraps Angular in a window
*   Launches .NET on startup
*   System tray, menus, shortcuts
*   Builds with `npm run build` ✅

#### 🔷 ASP.NET Core (Backend)

*   REST API endpoints
*   Database access (EF Core)
*   Business logic
*   You already know this ✅

#### 🍓 Raspberry Pi Deploy

*   Git pull on Pi
*   `npm run build` on Pi
*   `dotnet publish` on Pi
*   No cross-compilation ✅

📁 Project Folder Structure
---------------------------

my-dashboard/  
├── frontend/ \# Angular app  
│ ├── src/  
│ │ ├── app/  
│ │ │ ├── dashboard/ \# dashboard components  
│ │ │ ├── shared/ \# shared components  
│ │ │ └── services/ \# HTTP services to call .NET API  
│ │ └── environments/  
│ ├── angular.json  
│ └── package.json  
│  
├── backend/ \# ASP.NET Core Web API  
│ ├── Controllers/ \# API controllers  
│ ├── Models/ \# Data models  
│ ├── Services/ \# Business logic  
│ ├── Data/ \# EF Core DbContext  
│ ├── Program.cs  
│ └── backend.csproj  
│  
├── electron/ \# Electron shell  
│ ├── main.js \# main process — launches window + .NET  
│ └── preload.js \# optional IPC bridge  
│  
├── package.json \# root — scripts to build everything  
└── README.md

📄 Key Configuration Files
--------------------------

### Root `package.json` — One command to rule them all

{
  "name": "my-dashboard",
  "scripts": {
    // Development
    "dev":         "concurrently \\"npm run dev:backend\\" \\"npm run dev:frontend\\" \\"npm run dev:electron\\"",
    "dev:frontend": "cd frontend && ng serve --port 4200",
    "dev:backend":  "cd backend && dotnet run",
    "dev:electron": "wait-on http://localhost:4200 && electron electron/main.js",

    // Production build (run this on Ubuntu PC or Raspberry Pi)
    "build":          "npm run build:frontend && npm run build:backend && npm run build:electron",
    "build:frontend": "cd frontend && ng build --configuration production",
    "build:backend":  "cd backend && dotnet publish -c Release -o ../dist/backend",
    "build:electron": "electron-builder"
  },
  "devDependencies": {
    "electron":         "^28.0.0",
    "electron-builder": "^24.0.0",
    "concurrently":     "^8.0.0",
    "wait-on":          "^7.0.0"
  }
}

### `electron/main.js` — Launches .NET, then opens window

const { app, BrowserWindow } = require('electron');
const { spawn } = require('child\_process');
const path = require('path');

let dotnetProcess;

function startDotNet() {
  // Launch your ASP.NET Core backend as a local sidecar process
  dotnetProcess = spawn(
    path.join(\_\_dirname, '../dist/backend/backend'),
    \[\], { stdio: 'inherit' }
  );
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    webPreferences: { preload: path.join(\_\_dirname, 'preload.js') }
  });

  // In production: load built Angular files
  win.loadFile(path.join(\_\_dirname, '../dist/frontend/index.html'));
  // In development: load Angular dev server
  // win.loadURL('http://localhost:4200');
}

app.whenReady().then(() => {
  startDotNet();
  // Wait a moment for .NET to start, then open window
  setTimeout(createWindow, 1500);
});

app.on('will-quit', () => {
  // Kill .NET process when app closes
  if (dotnetProcess) dotnetProcess.kill();
});

### `backend/Program.cs` — Restrict API to localhost only

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options => {
    options.AddPolicy("LocalOnly", policy => {
        // Only Angular (Electron) can call this API
        policy.WithOrigins("http://localhost:4200", "file://")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors("LocalOnly");
app.MapControllers();
// Bind to localhost only — not exposed on network
app.Run("http://localhost:5000");

### Angular Service — Calling the .NET API

// frontend/src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getDashboardData() {
    return this.http.get(\`${this.apiUrl}/dashboard\`);
  }
}

💻 Development Workflow (Ubuntu PC)
-----------------------------------

1

#### Install prerequisites once

Node.js + npm, .NET SDK 8, Angular CLI (`npm install -g @angular/cli`), Git

2

#### Start everything with one command

`npm run dev` — starts Angular dev server, .NET API, and Electron window simultaneously

3

#### Develop normally in VS Code

Edit Angular components → browser hot-reloads. Edit .NET controllers → restart backend. No special config needed.

4

#### Push to Git when ready

`git push` — your code is ready to deploy to Raspberry Pi

🍓 Raspberry Pi Deployment Workflow
-----------------------------------

git pull

→

npm install

→

npm run build

→

App runs on Pi ✅

1

#### First time Pi setup (once)

Install Node.js, .NET Runtime 8, Git on the Pi. Clone your repo. Takes ~30 minutes.

2

#### Every update after that

SSH into Pi → `git pull` → `npm run build`. Pi 4/5 builds in a few minutes.

3

#### Auto-start on Pi boot (optional)

Add a systemd service or `~/.config/autostart` entry so the dashboard launches automatically when Pi boots.

💡 **Tip:** Raspberry Pi 4 (4GB) or Pi 5 is recommended. The build may take 5–10 minutes on Pi but runs fast after that. Pi 4 is perfectly capable of running an Electron dashboard smoothly.

⚠️ **Pi display requirement:** Electron needs a display (monitor or HDMI). For headless Pi setups, you'd use a different stack. If your Pi has a touchscreen or HDMI monitor attached, you're good to go.

📦 Recommended Packages
-----------------------

#### Angular Frontend

*   `@angular/material` — UI components
*   `ng2-charts` — Chart.js wrapper
*   `@ngrx/store` — state management
*   `@angular/flex-layout` — responsive layout

#### ASP.NET Core Backend

*   `Microsoft.EntityFrameworkCore`
*   `Npgsql` or `SQLite` — database
*   `Swashbuckle` — Swagger API docs
*   `SignalR` — real-time data push

#### Electron

*   `electron-builder` — packaging
*   `electron-updater` — auto-update
*   `electron-log` — logging
*   `wait-on` — wait for backend ready

#### Dev Tools

*   `concurrently` — run multiple commands
*   `cross-env` — cross-platform env vars
*   `nodemon` — auto-restart on change
*   VS Code + Angular + C# extensions

🖥️ VS Code Setup
-----------------

Install these VS Code extensions for the best experience:

①

#### Angular Language Service

IntelliSense for Angular templates

②

#### C# Dev Kit

Full .NET support — IntelliSense, debugging, run/build tasks

③

#### ESLint + Prettier

Code formatting for TypeScript/Angular

④

#### Remote - SSH

Connect VS Code directly to your Raspberry Pi for remote development

🚀 **Getting started:** The best first step is to create the Angular app (`ng new frontend`), create the .NET API (`dotnet new webapi -n backend`), and then create the root `package.json` with the scripts shown above. You'll have a working skeleton in under an hour.