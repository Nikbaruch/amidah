"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type FlipDir = 1 | -1;

export type CardFlipProps = {
  frontSrc: string;
  backSrc: string;
  rot: number;
  onFlip: (dir: FlipDir) => void; // compat (géré dans page.tsx)
  priority?: boolean;
};

export default function CardFlip({
  frontSrc,
  backSrc,
  rot,
  priority = false,
}: CardFlipProps) {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Carte (aucun overflow hidden => pas de crop pendant la rotation) */}
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
    </div>
  );
}
