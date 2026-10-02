import {
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";
import {
  ELYNDRA_BLOCKED_CELLS,
  ELYNDRA_GRID_SIZE,
  ELYNDRA_TRANSITION_GATES,
  getElyndraTerrain,
  gridKey,
  isElyndraWalkable,
  type GridPosition,
} from "./maps/elyndraSpawn";

const TILE_WIDTH = 96;
const TILE_HEIGHT = 48;
const PLAYER_Y_OFFSET = -18;
const STEP_DURATION_MS = 60;

type AstralyaAppOptions = {
  displayName: string;
  startX: number;
  startY: number;
  requestMove?: (destination: GridPosition) => Promise<GridPosition[] | null>;
  onMoveComplete?: () => void;
};

function clampGridCoordinate(value: number) {
  return Math.max(0, Math.min(ELYNDRA_GRID_SIZE - 1, Math.round(value)));
}

function isoToScreen(gridX: number, gridY: number) {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

function createTile(position: GridPosition) {
  const tile = new Graphics();
  const terrain = getElyndraTerrain(position);
  const isBlocked = !isElyndraWalkable(position);
  const parity = (position.x + position.y) % 2;

  const fill =
    terrain === "plaza"
      ? parity === 0
        ? 0x27435a
        : 0x223c52
      : terrain === "avenue"
        ? parity === 0
          ? 0x17384b
          : 0x143246
        : terrain === "district"
          ? parity === 0
            ? 0x173047
            : 0x132a40
          : parity === 0
            ? 0x10283b
            : 0x0d2234;

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
    .fill({ color: isBlocked ? 0x0a1725 : fill })
    .stroke({
      color: terrain === "plaza" ? 0x3e7891 : 0x1f6077,
      width: 1,
      alpha: isBlocked ? 0.35 : 0.7,
    });

  const screen = isoToScreen(position.x, position.y);
  tile.position.set(screen.x, screen.y);

  if (isBlocked) {
    tile.eventMode = "static";
    tile.cursor = "not-allowed";
    tile.alpha = 0.78;
  } else {
    tile.eventMode = "static";
    tile.cursor = "pointer";
  }

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

  const core = new Graphics().circle(0, 0, 5).fill({ color: 0xe0f2fe });

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

function createPathDot() {
  return new Graphics().circle(0, 0, 4).fill({
    color: 0x67e8f9,
    alpha: 0.58,
  });
}

function createObstacle(position: GridPosition) {
  const obstacle = new Container();
  const key = gridKey(position);

  if (key === "12,12") {
    const water = new Graphics()
      .ellipse(0, 8, 34, 16)
      .fill({ color: 0x0e7490, alpha: 0.7 })
      .stroke({ color: 0x67e8f9, width: 2, alpha: 0.55 });

    const pedestal = new Graphics()
      .ellipse(0, 3, 20, 9)
      .fill({ color: 0x253c53 })
      .stroke({ color: 0x64748b, width: 1 });

    const crystal = new Graphics()
      .poly([0, -44, 13, -17, 0, -2, -13, -17])
      .fill({ color: 0x67e8f9, alpha: 0.9 })
      .stroke({ color: 0xe0f2fe, width: 2, alpha: 0.8 });

    const glow = new Graphics()
      .circle(0, -20, 25)
      .fill({ color: 0x22d3ee, alpha: 0.08 });

    obstacle.addChild(water, pedestal, glow, crystal);
  } else if (
    key === "8,8" ||
    key === "16,8" ||
    key === "8,16" ||
    key === "16,16"
  ) {
    const base = new Graphics()
      .ellipse(0, 10, 25, 11)
      .fill({ color: 0x172b3e })
      .stroke({ color: 0x4a7188, width: 1 });

    const pillar = new Graphics()
      .roundRect(-9, -34, 18, 42, 4)
      .fill({ color: 0x8aa1b5 })
      .stroke({ color: 0xcbd5e1, width: 1, alpha: 0.55 });

    const cap = new Graphics()
      .poly([0, -51, 11, -36, 0, -27, -11, -36])
      .fill({ color: 0x38bdf8, alpha: 0.72 });

    obstacle.addChild(base, pillar, cap);
  } else {
    const planter = new Graphics()
      .ellipse(0, 10, 34, 14)
      .fill({ color: 0x183b34 })
      .stroke({ color: 0x2f6f5e, width: 1 });

    const foliage = new Graphics()
      .circle(-15, -2, 12)
      .circle(0, -9, 15)
      .circle(15, -1, 12)
      .fill({ color: 0x236957, alpha: 0.95 });

    const astralBud = new Graphics()
      .circle(0, -20, 5)
      .fill({ color: 0x67e8f9, alpha: 0.85 });

    obstacle.addChild(planter, foliage, astralBud);
  }

  const screen = isoToScreen(position.x, position.y);
  obstacle.position.set(screen.x, screen.y - 3);
  return obstacle;
}


function createTransitionGate(position: GridPosition) {
  const gate = new Container();
  const ring = new Graphics()
    .ellipse(0, 4, 27, 12)
    .fill({ color: 0x0e7490, alpha: 0.22 })
    .stroke({ color: 0x67e8f9, width: 2, alpha: 0.85 });

  const inner = new Graphics()
    .ellipse(0, 1, 16, 7)
    .fill({ color: 0x22d3ee, alpha: 0.28 });

  const spark = new Graphics()
    .poly([0, -23, 7, -8, 0, -1, -7, -8])
    .fill({ color: 0xe0f2fe, alpha: 0.9 });

  gate.addChild(ring, inner, spark);
  const screen = isoToScreen(position.x, position.y);
  gate.position.set(screen.x, screen.y - 4);
  return gate;
}

function createMapTitle() {
  const container = new Container();
  const title = new Text({
    text: "ELYNDRA",
    style: new TextStyle({
      fill: 0xe0f2fe,
      fontFamily: "Arial",
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 5,
      stroke: { color: 0x020617, width: 5 },
    }),
  });
  const subtitle = new Text({
    text: "PLACE ASTRALE",
    style: new TextStyle({
      fill: 0x67e8f9,
      fontFamily: "Arial",
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 3,
      stroke: { color: 0x020617, width: 3 },
    }),
  });

  title.anchor.set(0.5);
  subtitle.anchor.set(0.5);
  subtitle.position.set(0, 24);
  container.addChild(title, subtitle);

  const screen = isoToScreen(12, 7);
  container.position.set(screen.x, screen.y - 100);
  return container;
}

function getNeighbors(position: GridPosition) {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 },
  ].filter(isElyndraWalkable);
}

function buildPath(from: GridPosition, to: GridPosition) {
  if (!isElyndraWalkable(from) || !isElyndraWalkable(to)) {
    return [] as GridPosition[];
  }

  const startKey = gridKey(from);
  const targetKey = gridKey(to);
  const queue: GridPosition[] = [{ ...from }];
  const visited = new Set([startKey]);
  const previous = new Map<string, GridPosition>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    if (gridKey(current) === targetKey) {
      const path: GridPosition[] = [];
      let cursor = { ...to };

      while (gridKey(cursor) !== startKey) {
        path.unshift(cursor);
        const parent = previous.get(gridKey(cursor));

        if (!parent) {
          return [];
        }

        cursor = parent;
      }

      return path;
    }

    for (const neighbor of getNeighbors(current)) {
      const neighborKey = gridKey(neighbor);

      if (visited.has(neighborKey)) {
        continue;
      }

      visited.add(neighborKey);
      previous.set(neighborKey, current);
      queue.push(neighbor);
    }
  }

  return [] as GridPosition[];
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
  const terrainLayer = new Container();
  const pathLayer = new Container();
  const objectLayer = new Container();
  const actorLayer = new Container();

  world.addChild(terrainLayer, pathLayer, objectLayer, actorLayer);
  app.stage.addChild(world);

  const requestedStart: GridPosition = {
    x: clampGridCoordinate(options.startX),
    y: clampGridCoordinate(options.startY),
  };
  const currentPosition = isElyndraWalkable(requestedStart)
    ? requestedStart
    : { x: 6, y: 9 };

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

  const clearPathPreview = () => {
    pathLayer.removeChildren().forEach((child) => child.destroy());
  };

  const renderPathPreview = (path: GridPosition[]) => {
    clearPathPreview();

    for (const position of path) {
      const dot = createPathDot();
      const screen = isoToScreen(position.x, position.y);
      dot.position.set(screen.x, screen.y);
      pathLayer.addChild(dot);
    }
  };

  const moveTo = async (destination: GridPosition) => {
    if (
      moving ||
      !isElyndraWalkable(destination) ||
      (destination.x === currentPosition.x &&
        destination.y === currentPosition.y)
    ) {
      return;
    }

    moving = true;
    moveTargetMarker(destination);

    const path =
      (await options.requestMove?.(destination)) ??
      buildPath(currentPosition, destination);

    if (
      disposed ||
      path.length === 0 ||
      gridKey(path[path.length - 1] ?? currentPosition) !== gridKey(destination)
    ) {
      targetMarker.visible = false;
      clearPathPreview();
      moving = false;
      options.onMoveComplete?.();
      return;
    }

    renderPathPreview(path);

    for (const step of path) {
      if (disposed) {
        break;
      }

      const from = { ...currentPosition };
      await animateStep(player, from, step, () => disposed);
      currentPosition.x = step.x;
      currentPosition.y = step.y;
    }

    targetMarker.visible = false;
    clearPathPreview();
    moving = false;
    options.onMoveComplete?.();
  };

  for (let x = 0; x < ELYNDRA_GRID_SIZE; x += 1) {
    for (let y = 0; y < ELYNDRA_GRID_SIZE; y += 1) {
      const position = { x, y };
      const tile = createTile(position);
      const walkable = isElyndraWalkable(position);

      tile.on("pointerover", () => {
        if (!moving && walkable) {
          tile.tint = 0x9eeaf9;
        }
      });

      tile.on("pointerout", () => {
        tile.tint = 0xffffff;
      });

      tile.on("pointertap", () => {
        tile.tint = 0xffffff;

        if (walkable) {
          void moveTo(position);
        }
      });

      terrainLayer.addChild(tile);
    }
  }

  objectLayer.addChild(createMapTitle());

  for (const position of ELYNDRA_BLOCKED_CELLS) {
    objectLayer.addChild(createObstacle(position));
  }

  for (const position of ELYNDRA_TRANSITION_GATES) {
    objectLayer.addChild(createTransitionGate(position));
  }

  actorLayer.addChild(targetMarker);
  movePlayerToGrid(currentPosition);
  actorLayer.addChild(player);

  const updateCameraScale = () => {
    const scale = app.screen.width < 640 ? 0.72 : app.screen.width < 1100 ? 0.82 : 0.92;
    world.scale.set(scale);
  };

  const snapCameraToPlayer = () => {
    const scale = world.scale.x;
    world.position.set(
      app.screen.width / 2 - player.position.x * scale,
      app.screen.height * 0.48 - player.position.y * scale,
    );
  };

  const followPlayer = () => {
    const scale = world.scale.x;
    const targetX = app.screen.width / 2 - player.position.x * scale;
    const targetY = app.screen.height * 0.48 - player.position.y * scale;
    const smoothing = moving ? 0.24 : 0.2;

    world.position.x += (targetX - world.position.x) * smoothing;
    world.position.y += (targetY - world.position.y) * smoothing;
  };

  const handleResize = () => {
    updateCameraScale();
    snapCameraToPlayer();
  };

  updateCameraScale();
  snapCameraToPlayer();
  app.ticker.add(followPlayer);
  app.renderer.on("resize", handleResize);

  return () => {
    disposed = true;
    app.ticker.remove(followPlayer);
    app.renderer.off("resize", handleResize);
    app.destroy(true, { children: true });
  };
}
