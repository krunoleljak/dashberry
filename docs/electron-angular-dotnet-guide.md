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
*   Charts (Signals, ECharts, etc.)
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


💻 Development Workflow (Ubuntu PC)
-----------------------------------

1

#### Install prerequisites once

Node.js 22 LTS + npm, .NET SDK 9, Angular CLI 21 (`npm install -g @angular/cli`), Git

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

Install Node.js 22 LTS, .NET Runtime 9, Git on the Pi. Clone your repo. Takes ~30 minutes.

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
*   `ngx-echarts` + `echarts` — Apache ECharts wrapper (tree-shakeable)
*   `@ngrx/signals` — signal-based state management (SignalStore)
*   `@angular/cdk` — layout utilities (BreakpointObserver)

#### ASP.NET Core Backend

*   `Microsoft.EntityFrameworkCore`
*   `Npgsql` or `SQLite` — database
*   `Swashbuckle` — OpenAPI / Swagger docs
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
