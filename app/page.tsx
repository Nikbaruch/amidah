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
  const [h, setH] = useState(0);
  const dragY = useMotionValue(0);

  // 1. Gestion de la hauteur et blocage du scroll
  useEffect(() => {
    setH(window.innerHeight);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }, []);

  // 2. MÉCANISME DE PRÉCHARGEMENT
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };

    // On précharge la carte suivante ET la carte précédente
    if (index < cards.length - 1) {
      preloadImage(cards[index + 1].frontSrc);
      preloadImage(cards[index + 1].backSrc);
    }
    if (index > 0) {
      preloadImage(cards[index - 1].frontSrc);
      preloadImage(cards[index - 1].backSrc);
    }
  }, [index, cards]);

  const hasNext = index < cards.length - 1;
  const hasPrev = index > 0;

  // 3. Logique d'empilement (Stacking)
  // Quand on tire vers le haut (dragY < 0), la carte actuelle est fixe (0)
  const currentY = useTransform(dragY, (v) => (v < 0 ? 0 : v));
  // La carte suivante monte du bas vers le haut
  const nextY = useTransform(dragY, [0, -h], [h, 0]);

  const onDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -100 || velocity < -500) {
      if (hasNext) {
        animate(dragY, -h, { duration: 0.3, ease: "circOut" }).then(() => {
          setIndex(prev => prev + 1);
          dragY.set(0);
        });
      } else animate(dragY, 0);
    } else if (offset > 100 || velocity > 500) {
      if (hasPrev) {
        animate(dragY, h, { duration: 0.3, ease: "circOut" }).then(() => {
          setIndex(prev => prev - 1);
          dragY.set(0);
        });
      } else animate(dragY, 0);
    } else {
      animate(dragY, 0);
    }
  };

  return (
    <main className="fixed inset-0 bg-neutral-950 overflow-hidden touch-none select-none">
      {/* Fond */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Image src="/images/fond.png" alt="fond" fill className="object-cover" />
      </div>

      <div className="relative h-full w-full flex items-center justify-center">
        
        {/* CARTE DESSOUS (Précédente) */}
        {hasPrev && (
          <div className="absolute inset-0 z-0">
            <CardFlip {...cards[index - 1]} rot={rot} />
          </div>
        )}

        {/* CARTE ACTUELLE */}
        <motion.div style={{ y: currentY }} className="absolute inset-0 z-10">
          <CardFlip {...cards[index]} rot={rot} priority />
        </motion.div>

        {/* CARTE SUIVANTE (Empilement par dessus) */}
        {hasNext && (
          <motion.div 
            style={{ y: nextY }} 
            className="absolute inset-0 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]"
          >
            <CardFlip {...cards[index + 1]} rot={rot} />
          </motion.div>
        )}

        {/* ZONE DE CAPTURE (Geste) */}
        <motion.div
          className="absolute inset-0 z-50"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={onDragEnd}
          onClick={() => setRot(r => r + 180)}
        />
      </div>
    </main>
  );
}