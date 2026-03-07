# Widget Layout System
## Customizable Dashboard Grid — Implementation Guide

> Extends: `plugin-architecture.md`  
> Library: GridStack.js · Storage: JSON files · Angular 21 (Signals) · ASP.NET Core 9

---

## Table of Contents

1. [Overview](#overview)
2. [Data Model](#data-model)
3. [JSON File Storage](#json-file-storage)
4. [ASP.NET Core — Layout API](#aspnet-core--layout-api)
5. [Angular — GridStack Integration](#angular--gridstack-integration)
6. [Layout Manager UI](#layout-manager-ui)
7. [Widget Picker (Add Widgets)](#widget-picker-add-widgets)
8. [Edit Mode vs View Mode](#edit-mode-vs-view-mode)
9. [Default Layout & Reset](#default-layout--reset)
10. [Full File Structure](#full-file-structure)

---

## Overview

The layout system uses **GridStack.js** for drag/resize and **JSON files** for persistence.

Each layout file describes a named grid configuration — which widgets are placed,
where, and at what size. The active layout is tracked in a separate `state.json` file.

### User Capabilities

| Action | How |
|---|---|
| Drag to reposition | GridStack drag handle |
| Resize widget | GridStack resize handle (bottom-right corner) |
| Add widget | Widget picker panel → click to add |
| Remove widget | ✕ button on widget in edit mode |
| Create new layout | "New Layout" button → enter name |
| Rename layout | Double-click layout tab name |
| Switch layout | Click layout tab |
| Reset to default | "Reset" button per layout |

---

## JSON File Storage

### Example `home.layout.json`

> Note: The same plugin (`cpu-monitor`) appears twice with different `instanceId` values
> and different settings — this is intentional and fully supported.

---

---

## Widget Picker (Add Widgets)

A slide-in panel showing all available plugins. Click to add to the current layout.

---

## Default Layout & Reset

The `default` layout:
- Is **always present** — created on first run if missing
- **Cannot be deleted** (enforced by `LayoutService.DeleteAsync`)
- **Can be reset** — clears all widgets back to empty
- Acts as a fallback if another layout's file is corrupted or missing

---

## Full File Structure

> ⚠️ Add `data/` to `.gitignore` — layout files are user data, not source code.
> For Raspberry Pi deployment, copy the `data/` folder separately or let users
> configure their layout fresh on each device.

---

## Key Implementation Notes

**GridStack column count** — use 12 columns (standard). Widget `W` values map to Bootstrap-style widths (4 = one-third, 6 = half, 12 = full width).

**Auto-save debounce** — save 800ms after the last grid change. This avoids hammering the filesystem on every pixel of a drag.

**Same plugin, multiple instances** — `instanceId` is unique per placement (`cpu-monitor-1`, `cpu-monitor-2`). `widgetId` points to the plugin. Each instance has its own settings.

**Data folder location** — set `DataPath` in `appsettings.json`. Use a path outside the app directory so it survives app updates:

---

*Last updated: March 2026 · GridStack 10.x · Angular 21 (Signals) · ASP.NET Core 9*
