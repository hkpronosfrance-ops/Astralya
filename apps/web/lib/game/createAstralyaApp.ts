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
    .stroke({ color: 0x1d5c75, width: 1, alpha: 0.55 });

  const position = isoToScreen(gridX, gridY);
  tile.position.set(position.x, position.y);

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

export async function createAstralyaApp(\n  host: HTMLDivElement,\n  options: { displayName: string },\n) {
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

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      world.addChild(createTile(x, y));
    }
  }

  const center = Math.floor(GRID_SIZE / 2);
  const player = createPlayerMarker(options.displayName);
  const playerPosition = isoToScreen(center, center);
  player.position.set(playerPosition.x, playerPosition.y - 18);
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
    app.renderer.off("resize", positionWorld);
    app.destroy(true, { children: true });
  };
}
