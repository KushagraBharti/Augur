# Augur Implementation Plan

This plan follows dependency order, not reduced product versions.

## 1. Foundation

Create the monorepo structure, Supabase local config, shared core package, web app shell, worker folder, MCP package, and Augur skill.

## 2. Database

Create Supabase migrations for companies, data sources, raw records, normalized city records, bills, bill documents, lobby records, signal scores, agent runs, tool calls, evidence items, reports, and contact paths.

## 3. Data Connectors

Implement connectors in `packages/augur-core` for OpenStates, TLO RSS, TLO FTP, TEC downloads, Austin Socrata, Dallas Socrata, San Antonio CKAN/API/downloads, and Houston if clean.

## 4. Agent Tools

Wrap core functions as bounded tools: `search_texas_bills`, `get_texas_bill_documents`, `query_city_dataset`, `search_lobby_activity`, `web_research`, `update_signal_scores`, and `save_markdown_report`.

Every tool call writes to `agent_tool_calls`.

## 5. Ask Mode

Implement the prompt-driven Augur Analyst flow: load company profile, call tools, retrieve evidence, update scores, save report, and render activity.

## 6. Live And Replay Monitor

Implement `SignalWindow` with `live` and `replay` modes. Both modes run the same pipeline. Replay only uses real cached historical public records.

## 7. Dashboard

Build the dark command-center UI with Overview, Texas Map, City Signals, Bills, Lobby Signals, Reports, and Agent Runs. Keep raw data behind evidence drawers.

## 8. MCP And Skill

Expose Augur MCP tools from `packages/augur-mcp` using shared `augur-core` functions. Keep the tracked Augur skill in `skills/augur-texas-business-intelligence`.

## 9. Miro

Add report-to-Miro sync only after the core product is working.
