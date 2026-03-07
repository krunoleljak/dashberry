# Dashboard Plugin Architecture
## IWidget Interface Contract & Implementation Guide

> Stack: Electron + Angular + ASP.NET Core  
> Target: Ubuntu AMD64 (dev) · Raspberry Pi 4/5 ARM64 (deploy)

---

## Table of Contents

1. [Overview](#overview)
2. [IWidget Interface (C#)](#iwidget-interface)
3. [WidgetManifest](#widgetmanifest)
4. [Settings Schema](#settings-schema)
5. [C# Plugin — Full Example](#c-plugin-full-example)
6. [Node Plugin Contract](#node-plugin-contract)
7. [Node Plugin — Full Example](#node-plugin-full-example)
8. [Plugin Host (ASP.NET Core)](#plugin-host)
9. [Angular Integration](#angular-integration)
10. [Plugin Folder Structure](#plugin-folder-structure)
11. [Lifecycle & Error Handling](#lifecycle--error-handling)
12. [GPIO / Hardware Access](#gpio--hardware-access)

---

## Overview

The plugin system follows a **data-only plugin model**:

- Plugins (C# DLL or Node.js folder) live in a `/plugins` directory
- ASP.NET Core scans and loads them at startup
- Each plugin provides **data + a manifest** (what to display, settings schema)
- Angular reads the manifest and renders the appropriate UI component
- Plugins never ship Angular/UI code — the shell app owns all UI rendering

---

## IWidget Interface

Define this in a **shared class library** (`Dashboard.Contracts`) that both the host app and C# plugins reference.

---

## IWidgetContext

The host provides this to each plugin on initialization — gives plugins access to host services without tight coupling.

---

## WidgetManifest

Describes to Angular how to render and interact with the widget.

---

## Settings Schema

Settings fields define the configuration UI Angular renders automatically.

---

## C# Plugin — Full Example

A complete CPU monitor plugin implementing `IWidget`.

### C# Plugin Project File

> ⚠️ `Private="false"` and `ExcludeAssets="runtime"` are critical — the plugin DLL must NOT bundle `Dashboard.Contracts.dll`, the host app provides it.

---

## Node Plugin Contract

Node plugins communicate with the host via **stdio JSON messages** (simplest) or a **local HTTP server** (more flexible).

---

## Node Plugin — Full Example

GPIO temperature sensor on Raspberry Pi.

---

## Plugin Host

The ASP.NET Core service that discovers, loads, and manages plugins.

---

---

## Lifecycle & Error Handling

### Key rules

- **A plugin crash must never crash the host.** Always wrap plugin calls in try/catch.
- **Each C# plugin loads in its own `AssemblyLoadContext`** so it can be unloaded.
- **Node plugins are separate OS processes** — isolation is automatic.
- **Plugin errors are returned as structured JSON** so Angular can show them in the widget frame instead of crashing the dashboard.

---

## GPIO / Hardware Access

### Node Plugin (Raspberry Pi)

> **Note:** GPIO access on Raspberry Pi requires running the app as root OR adding the user to the `gpio` group: `sudo usermod -aG gpio $USER`

---

*Last updated: March 2026 · Stack: .NET 8 · Angular 17 · Electron 28 · Node 20*
