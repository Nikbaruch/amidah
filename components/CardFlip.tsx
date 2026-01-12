"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "framer-motion";

type FlipDir = 1 | -1;

export type CardFlipProps = {
  frontSrc: string;
  backSrc: string;

  rot: number;
  onFlip: (dir: FlipDir) => void;

  // optionnel : pour mettre priority sur la carte affichée
  priority?: boolean;
};

export default function CardFlip({
  frontSrc,
  backSrc,
  rot,
  onFlip,
  priority = false,
}: CardFlipProps) {
  // Clavier: ←/→ flip
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onFlip(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onFlip(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFlip]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const ox = info.offset.x;
    const oy = info.offset.y;
    const vx = info.velocity.x;

    // On ne flip que si le geste est clairement horizontal
    if (Math.abs(ox) <= Math.abs(oy)) return;

    const swipePowerX = Math.abs(ox) * Math.abs(vx);
    const H = Math.abs(ox) > 45 || swipePowerX > 650;

    if (H) onFlip(ox < 0 ? 1 : -1);
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Fond derrière la carte */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/fond.png"
          alt="Fond carte"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Carte (ne capte pas les gestes) */}
      <div
        className="relative pointer-events-none"
        style={{
          width: "min(92vw, 420px)",
          aspectRatio: "1080 / 1522",
          perspective: "1200px",
          WebkitPerspective: "1200px",
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={false} // pas d’animation au montage
          animate={{ rotateY: rot }}
          transition={{ type: "spring", stiffness: 900, damping: 55, mass: 0.6 }}
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* FACE A */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translateZ(1px)",
            }}
          >
            <Image
              src={frontSrc}
              alt="Face A"
              fill
              priority={priority}
              className="object-contain"
              sizes="(max-width: 768px) 92vw, 420px"
            />
          </div>

          {/* FACE B */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
            }}
          >
            <Image
              src={backSrc}
              alt="Face B"
              fill
              priority={priority}
              className="object-contain"
              sizes="(max-width: 768px) 92vw, 420px"
            />
          </div>
        </motion.div>
      </div>

      {/* Layer gestes: uniquement horizontal pour flip + clic */}
      <motion.div
        className="absolute inset-0 z-20"
        style={{ touchAction: "none" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={() => onFlip(1)}
      />
    </div>
  );
}
