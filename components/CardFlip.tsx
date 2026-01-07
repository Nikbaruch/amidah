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
  onPrev?: () => void;
  onNext?: () => void;
};

export default function CardFlip({
  frontSrc,
  backSrc,
  rot,
  onFlip,
  onPrev,
  onNext,
}: CardFlipProps) {
  // Clavier
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
      } else if (e.key === "ArrowUp") {
        onPrev?.();
      } else if (e.key === "ArrowDown") {
        onNext?.();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFlip, onPrev, onNext]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const ox = info.offset.x;
    const oy = info.offset.y;
    const vx = info.velocity.x;
    const vy = info.velocity.y;

    const swipePowerX = Math.abs(ox) * Math.abs(vx);
    const swipePowerY = Math.abs(oy) * Math.abs(vy);

    const isHorizontal = Math.abs(ox) > Math.abs(oy);

    // seuils (un “coup de pouce”)
    const H = Math.abs(ox) > 45 || swipePowerX > 650;
    const V = Math.abs(oy) > 70 || swipePowerY > 850;

    // Horizontal => flip
    if (isHorizontal && H) {
      onFlip(ox < 0 ? 1 : -1);
      return;
    }

    // Vertical => change de carte
    if (!isHorizontal && V) {
      if (oy < 0) onNext?.(); // swipe vers le haut => suivante
      else onPrev?.(); // swipe vers le bas => précédente
    }
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* FOND IMAGE derrière la carte */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/fond.png"
          alt="Fond carte"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* CARTE (ne doit pas capter les gestes) */}
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
          initial={false}
          animate={{ rotateY: rot }}
          transition={{
            type: "spring",
            stiffness: 900,
            damping: 55,
            mass: 0.6,
          }}
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
              priority
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
              priority
              className="object-contain"
              sizes="(max-width: 768px) 92vw, 420px"
            />
          </div>
        </motion.div>
      </div>

      {/* GESTURES LAYER (AU-DESSUS) */}
      <motion.div
        className="absolute inset-0 z-20"
        style={{
          touchAction: "none", // crucial sur mobile: capter vertical + horizontal
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={() => onFlip(1)}
      />
    </div>
  );
}
