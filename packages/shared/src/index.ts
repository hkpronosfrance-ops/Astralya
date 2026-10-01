export type GridPosition = {
  x: number;
  y: number;
};

export type PlayerSnapshot = {
  id: string;
  displayName: string;
  level: number;
  hp: number;
  maxHp: number;
  position: GridPosition;
};

export const ASTRALYA_RULES = {
  baseActionPoints: 6,
  baseMovementPoints: 3,
} as const;
