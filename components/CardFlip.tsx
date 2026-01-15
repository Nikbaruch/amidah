"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type CardFlipProps = {
  frontSrc: string;
  backSrc: string;
  rot: number;
  priority?: boolean;
};

export default function CardFlip({
  frontSrc,
  backSrc,
  rot,
  priority = false,
}: CardFlipProps) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div
        className="relative w-full max-w-[420px] aspect-[1080/1522]"
        style={{ perspective: "1500px" }}
      >
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateY: rot }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FACE FRONT */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Image
              src={frontSrc}
              alt="prayer front"
              fill
              className="object-cover"
              priority={priority}
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>

          {/* FACE BACK */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            <Image
              src={backSrc}
              alt="prayer back"
              fill
              className="object-cover"
              priority={priority}
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}