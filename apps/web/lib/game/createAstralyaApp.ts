import {
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";

const TILE_WIDTH = 96;
const TILE_HEIGHT = 48;
const GRID_SIZE = 11;
const PLAYER_Y_OFFSET = -18;
const STEP_DURATION_MS = 135;

type GridPosition = {
  x: number;
  y: number;
};

type AstralyaAppOptions = {
  displayName: string;
  startX: number;
  startY: number;
  validateStep?: (position: GridPosition) => Promise<boolean>;
  onMoveComplete?: () => void;
};

function clampGridCoordinate(value: number) {
  return Math.max(0, Math.min(GRID_SIZE - 1, Math.round(value)));
}

function isoToScreen(gridX: number, gridY: number) {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

function createTile(gridX: number, gridY: number) {
  const tile = new Graphics();
  const shade = (gridX + gridY) % 2 === 0 ? 0x10243c : 0x0d1f35;

  tile
    .poly([
      0,
      -TILE_HEIGHT / 2,
      TILE_WIDTH / 2,
      0,
      0,
      TILE_HEIGHT / 2,
      -TILE_WIDTH / 2,
      0,
    ])
    .fill({ color: shade })
    .stroke({ color: 0x1d5c75, width: 1, alpha: 0.62 });

  const position = isoToScreen(gridX, gridY);
  tile.position.set(position.x, position.y);
  tile.eventMode = "static";
  tile.cursor = "pointer";

  return tile;
}

function createPlayerMarker(displayName: string) {
  const player = new Container();

  const shadow = new Graphics()
    .ellipse(0, 18, 24, 10)
    .fill({ color: 0x000000, alpha: 0.35 });

  const body = new Graphics()
    .circle(0, 0, 16)
    .fill({ color: 0x1d4ed8 })
    .stroke({ color: 0x67e8f9, width: 3 });

  const core = new Graphics()
    .circle(0, 0, 5)
    .fill({ color: 0xe0f2fe });

  const label = new Text({
    text: displayName,
    style: new TextStyle({
      fill: 0xf8fafc,
      fontFamily: "Arial",
      fontSize: 13,
      fontWeight: "700",
      stroke: { color: 0x020617, width: 4 },
    }),
  });

  label.anchor.set(0.5, 1);
  label.position.set(0, -24);

  player.addChild(shadow, body, core, label);
  return player;
}

function createTargetMarker() {
  const marker = new Graphics()
    .circle(0, 0, 11)
    .fill({ color: 0x67e8f9, alpha: 0.2 })
    .stroke({ color: 0x67e8f9, width: 2, alpha: 0.9 });

  marker.visible = false;
  return marker;
}

function buildPath(from: GridPosition, to: GridPosition) {
  const path: GridPosition[] = [];
  let x = from.x;
  let y = from.y;

  while (x !== to.x) {
    x += x < to.x ? 1 : -1;
    path.push({ x, y });
  }

  while (y !== to.y) {
    y += y < to.y ? 1 : -1;
    path.push({ x, y });
  }

  return path;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

async function animateStep(
  player: Container,
  from: GridPosition,
  to: GridPosition,
  isDisposed: () => boolean,
) {
  const fromScreen = isoToScreen(from.x, from.y);
  const toScreen = isoToScreen(to.x, to.y);
  const startedAt = performance.now();

  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      if (isDisposed()) {
        resolve();
        return;
      }

      const rawProgress = Math.min(1, (now - startedAt) / STEP_DURATION_MS);
      const progress = easeInOut(rawProgress);

      player.position.set(
        fromScreen.x + (toScreen.x - fromScreen.x) * progress,
        fromScreen.y +
          (toScreen.y - fromScreen.y) * progress +
          PLAYER_Y_OFFSET,
      );

      if (rawProgress >= 1) {
        resolve();
        return;
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  });
}

export async function createAstralyaApp(
  host: HTMLDivElement,
  options: AstralyaAppOptions,
) {
  const app = new Application();

  await app.init({
    resizeTo: host,
    antialias: true,
    backgroundColor: 0x07111f,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  host.appendChild(app.canvas);

  const world = new Container();
  app.stage.addChild(world);

  const currentPosition: GridPosition = {
    x: clampGridCoordinate(options.startX),
    y: clampGridCoordinate(options.startY),
  };

  const targetMarker = createTargetMarker();
  const player = createPlayerMarker(options.displayName);
  let moving = false;
  let disposed = false;

  const movePlayerToGrid = (position: GridPosition) => {
    const screen = isoToScreen(position.x, position.y);
    player.position.set(screen.x, screen.y + PLAYER_Y_OFFSET);
  };

  const moveTargetMarker = (position: GridPosition) => {
    const screen = isoToScreen(position.x, position.y);
    targetMarker.position.set(screen.x, screen.y);
    targetMarker.visible = true;
  };

  const moveTo = async (destination: GridPosition) => {
    if (
      moving ||
      (destination.x === currentPosition.x &&
        destination.y === currentPosition.y)
    ) {
      return;
    }

    moving = true;
    moveTargetMarker(destination);

    const path = buildPath(currentPosition, destination);

    for (const step of path) {
      if (disposed) {
        break;
      }

      const accepted = await options.validateStep?.(step);

      if (accepted === false || disposed) {
        break;
      }

      const from = { ...currentPosition };
      await animateStep(player, from, step, () => disposed);
      currentPosition.x = step.x;
      currentPosition.y = step.y;
    }

    targetMarker.visible = false;
    moving = false;
    options.onMoveComplete?.();
  };

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const tile = createTile(x, y);

      tile.on("pointerover", () => {
        if (!moving) {
          tile.tint = 0x9eeaf9;
        }
      });

      tile.on("pointerout", () => {
        tile.tint = 0xffffff;
      });

      tile.on("pointertap", () => {
        tile.tint = 0xffffff;
        void moveTo({ x, y });
      });

      world.addChild(tile);
    }
  }

  world.addChild(targetMarker);
  movePlayerToGrid(currentPosition);
  world.addChild(player);

  const positionWorld = () => {
    world.position.set(app.screen.width / 2, app.screen.height * 0.34);

    const availableWidth = app.screen.width;
    const availableHeight = app.screen.height * 0.72;
    const gridWidth = GRID_SIZE * TILE_WIDTH;
    const gridHeight = GRID_SIZE * TILE_HEIGHT;

    const scale = Math.min(
      1,
      Math.max(
        0.55,
        Math.min(availableWidth / gridWidth, availableHeight / gridHeight),
      ),
    );

    world.scale.set(scale);
  };

  positionWorld();
  app.renderer.on("resize", positionWorld);

  return () => {
    disposed = true;
    app.renderer.off("resize", positionWorld);
    app.destroy(true, { children: true });
  };
}
