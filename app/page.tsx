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
  const [windowHeight, setWindowHeight] = useState(0);
  const dragY = useMotionValue(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasPrev = index > 0;
  const hasNext = index < cards.length - 1;

  // --- TRANSFORMATION D'EMPILEMENT ---
  // La carte actuelle s'éloigne vers le bas quand on veut voir la précédente (dragY > 0)
  // Mais elle reste FIXE (0) quand la suivante arrive (dragY < 0)
  const currentY = useTransform(dragY, [0, windowHeight], [0, windowHeight]);

  // La carte suivante part du bas de l'écran et remonte
  const nextY = useTransform(dragY, [0, -windowHeight], [windowHeight, 0]);

  const onDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -100 || velocity < -500) {
      if (hasNext) {
        animate(dragY, -windowHeight, { duration: 0.3, ease: "easeInOut" }).then(() => {
          setIndex(prev => prev + 1);
          dragY.set(0);
        });
      } else animate(dragY, 0);
    } else if (offset > 100 || velocity > 500) {
      if (hasPrev) {
        animate(dragY, windowHeight, { duration: 0.3, ease: "easeInOut" }).then(() => {
          setIndex(prev => prev - 1);
          dragY.set(0);
        });
      } else animate(dragY, 0);
    } else {
      animate(dragY, 0);
    }
  };

  return (
    <main className="fixed inset-0 bg-black overflow-hidden touch-none select-none">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="fond" fill className="object-cover opacity-30" />
      </div>

      <div className="relative h-full w-full flex items-center justify-center">
        {/* CARTE DESSOUS (PRÉCÉDENTE OU ACTUELLE SI ON SCROLLE VERS LE HAUT) */}
        {hasPrev && (
          <div className="absolute inset-0 z-0 opacity-50">
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

        {/* CARTE SUIVANTE (QUI ARRIVE PAR DESSUS) */}
        {hasNext && (
          <motion.div 
            style={{ y: nextY }} 
            className="absolute inset-0 z-20 shadow-[0_-15px_50px_rgba(0,0,0,0.8)]"
          >
            <CardFlip {...cards[index + 1]} rot={rot} />
          </motion.div>
        )}

        {/* ZONE DE GESTE */}
        <motion.div
          className="absolute inset-0 z-50"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={onDragEnd}
          onClick={() => setRot(r => r + 180)}
        />
      </div>
    </main>
  );
}