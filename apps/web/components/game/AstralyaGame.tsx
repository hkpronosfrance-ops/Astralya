"use client";

import { useEffect, useRef } from "react";
import { createAstralyaApp } from "@/lib/game/createAstralyaApp";

type AstralyaGameProps = {
  displayName: string;
  level: number;
  hp: number;
  maxHp: number;
};

export function AstralyaGame({
  displayName,
  level,
  hp,
  maxHp,
}: AstralyaGameProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;

    if (!host) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void createAstralyaApp(host, { displayName }).then((destroy) => {
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
  }, [displayName]);

  const healthPercent =
    maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

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

          <div className="hud-card prototype-badge">Prototype 0.1</div>
        </div>

        <div />

        <div className="hud-bottom">
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
