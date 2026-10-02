# Phase 4 — Elyndra map prototype

## Goal

Turn the empty movement grid into the first readable Astralya environment while keeping server-authoritative movement.

## Map

Map ID: `elyndra_spawn`

Prototype size: 11 × 11 cells.

Visual zones:

- outer terraces;
- astral avenues;
- central plaza;
- central astral fountain/crystal;
- four astral pillars;
- two lateral garden strips.

## Walkability

Blocked cells:

- central fountain: `5,5`;
- pillars: `2,2`, `8,2`, `2,8`, `8,8`;
- western garden: `1,4`, `1,5`, `1,6`;
- eastern garden: `9,4`, `9,5`, `9,6`.

The client uses BFS over orthogonal neighbors to find a shortest available route around these cells.

## Security

The same blocked-cell set is enforced in the deployed `move-character-step` Edge Function (version 2).

The client cannot directly update coordinates. Every animated step must still be accepted and persisted by the server first.

## Art direction status

All terrain and obstacles are procedural PixiJS placeholders. They establish layout, collision, scale, readability and pathfinding only. Final hand-authored 2D assets will replace them later without changing the map rules.
