export type GridPosition = {
  x: number;
  y: number;
};

export const ELYNDRA_GRID_SIZE = 11;

export const ELYNDRA_BLOCKED_CELLS: readonly GridPosition[] = [
  { x: 5, y: 5 },
  { x: 2, y: 2 },
  { x: 8, y: 2 },
  { x: 2, y: 8 },
  { x: 8, y: 8 },
  { x: 1, y: 4 },
  { x: 1, y: 5 },
  { x: 1, y: 6 },
  { x: 9, y: 4 },
  { x: 9, y: 5 },
  { x: 9, y: 6 },
];

export const ELYNDRA_BLOCKED_KEYS = new Set(
  ELYNDRA_BLOCKED_CELLS.map(({ x, y }) => `${x},${y}`),
);

export function gridKey(position: GridPosition) {
  return `${position.x},${position.y}`;
}

export function isInsideElyndra(position: GridPosition) {
  return (
    position.x >= 0 &&
    position.x < ELYNDRA_GRID_SIZE &&
    position.y >= 0 &&
    position.y < ELYNDRA_GRID_SIZE
  );
}

export function isElyndraWalkable(position: GridPosition) {
  return (
    isInsideElyndra(position) &&
    !ELYNDRA_BLOCKED_KEYS.has(gridKey(position))
  );
}

export function getElyndraTerrain(position: GridPosition) {
  if (position.x >= 3 && position.x <= 7 && position.y >= 3 && position.y <= 7) {
    return "plaza" as const;
  }

  if (position.x === 5 || position.y === 5) {
    return "avenue" as const;
  }

  return "terrace" as const;
}
