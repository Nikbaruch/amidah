"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import CardFlip from "@/components/CardFlip";

type CardData = { id: string; frontSrc: string; backSrc: string };

export default function Page() {
  const cards = useMemo<CardData[]>(() => [
    { id: "card-01", frontSrc: "/images/cards/card-01-a.png", backSrc: "/images/cards/card-01-b.png" },
    { id: "card-02", frontSrc: "/images/cards/card-02-a.png", backSrc: "/images/cards/card-02-b.png" },
    { id: "card-03", frontSrc: "/images/cards/card-03-a.png", backSrc: "/images/cards/card-03-b.png" },
    { id: "card-04", frontSrc: "/images/cards/card-04-a.png", backSrc: "/images/cards/card-04-b.png" },
    { id: "card-05", frontSrc: "/images/cards/card-05-a.png", backSrc: "/images/cards/card-05-b.png" },
    { id: "card-06", frontSrc: "/images/cards/card-06-a.png", backSrc: "/images/cards/card-06-b.png" },
    { id: "card-07", frontSrc: "/images/cards/card-07-a.png", backSrc: "/images/cards/card-07-b.png" },
    { id: "card-08", frontSrc: "/images/cards/card-08-a.png", backSrc: "/images/cards/card-08-b.png" },
    { id: "card-09", frontSrc: "/images/cards/card-09-a.png", backSrc: "/images/cards/card-09-b.png" },
    { id: "card-10", frontSrc: "/images/cards/card-10-a.png", backSrc: "/images/cards/card-10-b.png" },
    { id: "card-11", frontSrc: "/images/cards/card-11-a.png", backSrc: "/images/cards/card-11-b.png" },
    { id: "card-12", frontSrc: "/images/cards/card-12-a.png", backSrc: "/images/cards/card-12-b.png" },
    { id: "card-13", frontSrc: "/images/cards/card-13-a.png", backSrc: "/images/cards/card-13-b.png" },
    { id: "card-14", frontSrc: "/images/cards/card-14-a.png", backSrc: "/images/cards/card-14-b.png" },
    { id: "card-15", frontSrc: "/images/cards/card-15-a.png", backSrc: "/images/cards/card-15-b.png" },
    { id: "card-16", frontSrc: "/images/cards/card-16-a.png", backSrc: "/images/cards/card-16-b.png" },
    { id: "card-17", frontSrc: "/images/cards/card-17-a.png", backSrc: "/images/cards/card-17-b.png" },
    { id: "card-18", frontSrc: "/images/cards/card-18-a.png", backSrc: "/images/cards/card-18-b.png" },
  ], []);

  const [index, setIndex] = useState(0);
  const [rot, setRot] = useState(0);
  const [H, setH] = useState(0);
  const dragY = useMotionValue(0);

  // Mise à jour de la hauteur réelle de l'écran
  useEffect(() => {
    setH(window.innerHeight);
    const handleResize = () => setH(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasPrev = index > 0;
  const hasNext = index < cards.length - 1;

  // --- LOGIQUE DE SUPERPOSITION ---
  // Carte actuelle : ne bouge que si on revient en arrière (drag vers le bas)
  const currentY = useTransform(dragY, [0, H], [0, H]);
  
  // Carte suivante : elle part de H et arrive à 0 quand dragY va de 0 à -H
  const nextY = useTransform(dragY, [0, -H], [H, 0]);

  const flip = (d: 1 | -1) => setRot((r) => r + d * 180);

  const onDragEnd = (_e: any, info: PanInfo) => {
    const threshold = H * 0.2;
    const velocity = info.velocity.y;

    if (info.offset.y < -threshold || velocity < -500) {
      if (hasNext) {
        animate(dragY, -H, { type: "spring", bounce: 0, duration: 0.4 }).then(() => {
          setIndex(i => i + 1);
          dragY.set(0);
        });
      } else {
        animate(dragY, 0);
      }
    } else if (info.offset.y > threshold || velocity > 500) {
      if (hasPrev) {
        animate(dragY, H, { type: "spring", bounce: 0, duration: 0.4 }).then(() => {
          setIndex(i => i - 1);
          dragY.set(0);
        });
      } else {
        animate(dragY, 0);
      }
    } else {
      animate(dragY, 0);
    }
  };

  return (
    <main className="fixed inset-0 bg-neutral-900 overflow-hidden select-none touch-none">
      {/* Fond global */}
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="fond" fill className="object-cover opacity-40" priority />
      </div>

      <div className="relative h-full w-full">
        
        {/* CARTE PRÉCÉDENTE (Fond de pile fixe) */}
        {hasPrev && (
          <div className="absolute inset-0 z-0">
            <CardFlip {...cards[index - 1]} rot={rot} />
          </div>
        )}

        {/* CARTE ACTUELLE */}
        <motion.div 
          style={{ y: currentY }} 
          className="absolute inset-0 z-10"
        >
          <CardFlip {...cards[index]} rot={rot} priority />
        </motion.div>

        {/* CARTE SUIVANTE (Empilement par dessus) */}
        {hasNext && (
          <motion.div 
            style={{ y: nextY }} 
            className="absolute inset-0 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <CardFlip {...cards[index + 1]} rot={rot} />
          </motion.div>
        )}

        {/* ZONE DE CAPTURE GESTES */}
        <motion.div
          className="absolute inset-0 z-50"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={onDragEnd}
          onClick={() => flip(1)}
        />
      </div>
    </main>
  );
}