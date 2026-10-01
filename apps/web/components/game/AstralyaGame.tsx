"use client";

import { useEffect, useRef } from "react";
import { createAstralyaApp } from "@/lib/game/createAstralyaApp";

export function AstralyaGame() {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;

    if (!host) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void createAstralyaApp(host).then((destroy) => {
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
  }, []);

  return (
    <section className="game-frame" aria-label="Prototype Astralya">
      <div ref={canvasHostRef} className="game-canvas" />

      <div className="game-hud">
        <div className="hud-top">
          <div className="hud-card player-card">
            <div className="player-line">
              <span>Hayati</span>
              <span>Niv. 1</span>
            </div>
            <div className="status-bar" aria-label="Points de vie">
              <span />
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
