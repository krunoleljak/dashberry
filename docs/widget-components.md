# Widget Components
## Trading Price Card · Line Chart · AI Info Card
### Implementation Guide

> Extends: `plugin-architecture.md` · `widget-layout.md`  
> Angular 21 (Signals) · ngx-echarts (Apache ECharts) · ASP.NET Core 9 · GridStack

---

## Table of Contents

1. [Overview](#overview)
2. [Trading Price Card](#1-trading-price-card)
3. [Multi-Asset Line Chart](#2-multi-asset-line-chart)
4. [AI Info Card with Chat](#3-ai-info-card-with-chat)
5. [Shared Models](#shared-models)
6. [Backend Plugins](#backend-plugins)
7. [File Structure](#file-structure)

---

## Overview

Each widget follows the same pattern established in `plugin-architecture.md`:

### DisplayType mapping for these widgets

| Widget | DisplayType enum value |
|---|---|
| Trading Price Card | `PriceCard` |
| Multi-Asset Line Chart | `MultiLineChart` |
| AI Info Card | `AiInfoCard` |

Add these values to the `DisplayType` enum in `Dashboard.Contracts/WidgetManifest.cs`.

---

## 1. Trading Price Card

Displays current price, 24h change, and high/low for a single crypto or stock asset.

---

## 2. Multi-Asset Line Chart

Displays price-over-time for one or more assets on the same ECharts line series, with a time range selector.

---

## 3. AI Info Card with Chat

Displays a configurable AI-generated summary panel for any topic. Users can ask follow-up questions via quick-reply buttons or free text input. Powered by an LLM API call from the .NET backend.

---

---

## Notes

**Price Card — free APIs:**
CoinGecko's free tier allows ~30 calls/minute with no API key. Yahoo Finance's unofficial endpoint works for stocks but is unsupported — consider Alpha Vantage or Polygon.io for production.

**Line Chart — rate limiting:**
With multiple symbols and a 60s refresh, CoinGecko's free tier is comfortable. For 1H range, reduce to 3 symbols max to stay within limits. ECharts' incremental rendering handles streaming updates efficiently.

**AI Card — Ollama on Raspberry Pi:**
Ollama runs `llama3.2:3b` or `gemma2:2b` comfortably on a Pi 5 (8GB). Ideal for an offline dashboard with no API key needed. Install: `curl -fsSL https://ollama.com/install.sh | sh`

**Chat history:**
The history array sent to the backend is the full conversation so far. Keep it bounded — trim to last 10 messages to avoid large payloads and token limits.

---

*Last updated: March 2026 · Angular 21 (Signals) · ngx-echarts 21 (Apache ECharts) · ASP.NET Core 9*
