export type GridPosition = {
  x: number;
  y: number;
};

export type CharacterAppearance = {
  body: string;
  outfit: string;
  hair: string;
};

export type PlayerSnapshot = {
  id: string;
  displayName: string;
  level: number;
  hp: number;
  maxHp: number;
  position: GridPosition;
};

export type CharacterRecord = {
  id: string;
  userId: string;
  name: string;
  appearance: CharacterAppearance;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  actionPoints: number;
  movementPoints: number;
  currentMap: string;
  position: GridPosition;
  gold: number;
};

export const ASTRALYA_RULES = {
  maxLevel: 100,
  baseActionPoints: 6,
  baseMovementPoints: 3,
} as const;
