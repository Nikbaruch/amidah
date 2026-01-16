"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type CardFlipProps = {
  frontSrc: string;
  backSrc: string;
  rot: number;
  priority?: boolean;
};

export default function CardFlip({ frontSrc, backSrc, rot, priority }: CardFlipProps) {
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-[400px] aspect-[1080/1522]" style={{ perspective: "1200px" }}>
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateY: rot }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FACE A */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-white shadow-xl" style={{ backfaceVisibility: "hidden" }}>
            <Image src={frontSrc} alt="front" fill className="object-cover" priority={priority} />
          </div>
          {/* FACE B */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-white shadow-xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <Image src={backSrc} alt="back" fill className="object-cover" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}