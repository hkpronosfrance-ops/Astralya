"use client";

import { useEffect, useRef, useState } from "react";
import { createAstralyaApp } from "@/lib/game/createAstralyaApp";
import { createClient } from "@/lib/supabase/client";
import { getElyndraDistrict } from "@/lib/game/maps/elyndraSpawn";

type AstralyaGameProps = {
  displayName: string;
  level: number;
  hp: number;
  maxHp: number;
  startX: number;
  startY: number;
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
      validateStep: async (position) => {
        if (disposed) {
          return false;
        }

        setMovementStatus("moving");

        const { data, error } = await supabase.functions.invoke(
          "move-character-step",
          {
            body: {
              target_x: position.x,
              target_y: position.y,
            },
          },
        );

        if (
          error ||
          data?.position?.x !== position.x ||
          data?.position?.y !== position.y
        ) {
          setMovementStatus("rejected");
          return false;
        }

        setServerPosition(position);
        return true;
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
      ? "Validation serveur..."
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
            <span>La caméra suit ton personnage dans la zone.</span>
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
