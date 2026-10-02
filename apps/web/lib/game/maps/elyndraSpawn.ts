export type GridPosition = {
  x: number;
  y: number;
};

export const ELYNDRA_GRID_SIZE = 25;
export const ELYNDRA_CENTER = 12;

export const ELYNDRA_TRANSITION_GATES: readonly GridPosition[] = [
  { x: 12, y: 0 },
  { x: 24, y: 12 },
  { x: 12, y: 24 },
  { x: 0, y: 12 },
];

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

export function isElyndraBlocked(position: GridPosition) {
  const { x, y } = position;

  if (!isInsideElyndra(position)) {
    return true;
  }

  // Central astral fountain.
  if (x === 12 && y === 12) {
    return true;
  }

  // Four astral pylons framing the main plaza.
  if (
    (x === 8 && y === 8) ||
    (x === 16 && y === 8) ||
    (x === 8 && y === 16) ||
    (x === 16 && y === 16)
  ) {
    return true;
  }

  // Garden belts. Openings are intentionally left for pathfinding.
  if ((x === 5 || x === 19) && y >= 7 && y <= 17 && ![9, 12, 15].includes(y)) {
    return true;
  }

  if ((y === 5 || y === 19) && x >= 7 && x <= 17 && ![9, 12, 15].includes(x)) {
    return true;
  }

  // Small architectural clusters in the outer terraces.
  if (
    (x >= 2 && x <= 4 && y >= 2 && y <= 3) ||
    (x >= 20 && x <= 22 && y >= 2 && y <= 3) ||
    (x >= 2 && x <= 4 && y >= 21 && y <= 22) ||
    (x >= 20 && x <= 22 && y >= 21 && y <= 22)
  ) {
    return true;
  }

  return false;
}

export function isElyndraWalkable(position: GridPosition) {
  return isInsideElyndra(position) && !isElyndraBlocked(position);
}

export const ELYNDRA_BLOCKED_CELLS: readonly GridPosition[] = Array.from(
  { length: ELYNDRA_GRID_SIZE * ELYNDRA_GRID_SIZE },
  (_, index) => ({
    x: index % ELYNDRA_GRID_SIZE,
    y: Math.floor(index / ELYNDRA_GRID_SIZE),
  }),
).filter(isElyndraBlocked);

export function getElyndraTerrain(position: GridPosition) {
  const { x, y } = position;

  if (x >= 8 && x <= 16 && y >= 8 && y <= 16) {
    return "plaza" as const;
  }

  if (x === 12 || y === 12 || x === 11 || x === 13 || y === 11 || y === 13) {
    return "avenue" as const;
  }

  if (
    (x <= 6 && y <= 6) ||
    (x >= 18 && y <= 6) ||
    (x <= 6 && y >= 18) ||
    (x >= 18 && y >= 18)
  ) {
    return "district" as const;
  }

  return "terrace" as const;
}

export function getElyndraDistrict(position: GridPosition) {
  const { x, y } = position;

  if (x >= 8 && x <= 16 && y >= 8 && y <= 16) {
    return "Place Astrale";
  }

  if (y < 8) {
    return "Terrasses du Nord";
  }

  if (x > 16) {
    return "Quartier de l'Aube";
  }

  if (y > 16) {
    return "Jardins Suspendus";
  }

  if (x < 8) {
    return "Promenade des Astres";
  }

  return "Elyndra";
}
