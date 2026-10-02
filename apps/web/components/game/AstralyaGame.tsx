"use client";

import { useEffect, useRef, useState } from "react";
import { createAstralyaApp } from "@/lib/game/createAstralyaApp";
import { createClient } from "@/lib/supabase/client";
import {
  getElyndraDistrict,
  type GridPosition,
} from "@/lib/game/maps/elyndraSpawn";

type AstralyaGameProps = {
  displayName: string;
  level: number;
  hp: number;
  maxHp: number;
  startX: number;
  startY: number;
};

type MoveResponse = {
  position?: GridPosition;
  path?: GridPosition[];
};

export function AstralyaGame({
  displayName,
  level,
  hp,
  maxHp,
  startX,
  startY,
}: AstralyaGameProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [serverPosition, setServerPosition] = useState({ x: startX, y: startY });
  const [movementStatus, setMovementStatus] = useState<
    "ready" | "moving" | "rejected"
  >("ready");

  useEffect(() => {
    const host = canvasHostRef.current;

    if (!host) {
      return;
    }

    const supabase = createClient();
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void createAstralyaApp(host, {
      displayName,
      startX,
      startY,
      requestMove: async (destination) => {
        if (disposed) {
          return null;
        }

        setMovementStatus("moving");

        const { data, error } = await supabase.functions.invoke<MoveResponse>(
          "move-character-step",
          {
            body: {
              target_x: destination.x,
              target_y: destination.y,
            },
          },
        );

        if (
          error ||
          !Array.isArray(data?.path) ||
          !data?.position ||
          data.position.x !== destination.x ||
          data.position.y !== destination.y
        ) {
          setMovementStatus("rejected");
          return null;
        }

        setServerPosition(data.position);
        return data.path;
      },
      onMoveComplete: () => {
        if (!disposed) {
          setMovementStatus("ready");
        }
      },
    }).then((destroy) => {
      if (disposed) {
        destroy();
        return;
      }

      cleanup = destroy;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [displayName, startX, startY]);

  const healthPercent =
    maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  const statusLabel =
    movementStatus === "moving"
      ? "Calcul du trajet..."
      : movementStatus === "rejected"
        ? "Déplacement refusé"
        : "Synchronisé";

  return (
    <section className="game-frame" aria-label="Prototype Astralya">
      <div ref={canvasHostRef} className="game-canvas" />

      <div className="game-hud">
        <div className="hud-top">
          <div className="hud-card player-card">
            <div className="player-line">
              <span>{displayName}</span>
              <span>Niv. {level}</span>
            </div>
            <div className="status-bar" aria-label="Points de vie">
              <span style={{ width: `${healthPercent}%` }} />
            </div>
            <div className="health-label">
              {hp} / {maxHp} PV
            </div>
          </div>

          <div className="hud-card prototype-badge">Prototype 0.5</div>
        </div>

        <div />

        <div className="hud-bottom">
          <div className="movement-hint hud-card">
            <strong>Elyndra · {getElyndraDistrict(serverPosition)}</strong>
            <span>Clique sur une destination : le serveur calcule le trajet.</span>
            <small>
              Position serveur : {serverPosition.x}, {serverPosition.y}
            </small>
            <small>{statusLabel}</small>
          </div>

          <div className="hud-card action-bar" aria-label="Barre d'actions">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="action-slot" key={index}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
