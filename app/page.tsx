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

function clamp(i: number, len: number) {
  if (i < 0) return 0;
  if (i >= len) return len - 1;
  return i;
}

export default function Page() {
  const cards = useMemo<CardData[]>(
    () => [
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
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const hasPrev = index > 0;
  const hasNext = index < cards.length - 1;

  const [rot, setRot] = useState(0);
  const flip = (d: 1 | -1) => setRot((r) => r + d * 180);

  // Lock scroll browser
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }, []);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [H, setH] = useState(800); // Valeur par défaut plus haute pour mobile

  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;
    const updateH = () => setH(el.offsetHeight);
    updateH();
    window.addEventListener("resize", updateH);
    return () => window.removeEventListener("resize", updateH);
  }, []);

  const y = useMotionValue(0);

  // --- LOGIQUE D'EMPILEMENT ---
  // La carte actuelle NE BOUGE PAS quand on tire vers le haut (index suivant)
  // Elle ne bouge que vers le bas si on veut revenir à la précédente.
  const currentY = useTransform(y, (v) => (v > 0 ? v : 0));

  // La carte suivante monte depuis le bas (H) vers le centre (0)
  const nextY = useTransform(y, (v) => (v < 0 ? H + v : H));

  // La carte précédente est fixe derrière
  const prevY = 0;

  const axisLock = useRef<"x" | "y" | null>(null);
  const current = cards[index];
  const prev = hasPrev ? cards[index - 1] : null;
  const next = hasNext ? cards[index + 1] : null;

  async function snapTo(target: "next" | "prev" | "center") {
    const to = target === "next" ? -H : target === "prev" ? H : 0;
    await animate(y, to, { duration: 0.4, ease: [0.23, 1, 0.32, 1] }).finished;
    
    if (target !== "center") {
      setIndex((i) => clamp(i + (target === "next" ? 1 : -1), cards.length));
      y.set(0);
    }
  }

  function onDrag(_e: unknown, info: PanInfo) {
    const { offset, delta } = info;
    if (!axisLock.current) {
      if (Math.abs(offset.x) > 10) axisLock.current = "x";
      else if (Math.abs(offset.y) > 10) axisLock.current = "y";
    }

    if (axisLock.current === "y") {
      // Restriction : on ne peut pas tirer vers le bas s'il n'y a pas de carte précédente
      if (!hasPrev && offset.y > 0) y.set(offset.y * 0.2); // Effet élastique
      else if (!hasNext && offset.y < 0) y.set(offset.y * 0.2);
      else y.set(offset.y);
    }
  }

  async function onDragEnd(_e: unknown, info: PanInfo) {
    if (axisLock.current === "x") {
      if (Math.abs(info.offset.x) > 60) flip(info.offset.x < 0 ? 1 : -1);
    } else if (axisLock.current === "y") {
      const threshold = H * 0.2;
      const velocity = info.velocity.y;

      if (info.offset.y < -threshold || velocity < -500) {
        hasNext ? await snapTo("next") : await snapTo("center");
      } else if (info.offset.y > threshold || velocity > 500) {
        hasPrev ? await snapTo("prev") : await snapTo("center");
      } else {
        await snapTo("center");
      }
    }
    axisLock.current = null;
  }

  return (
    <main className="relative h-dvh w-full bg-stone-900 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="Fond" fill priority className="object-cover opacity-50" />
      </div>

      <div ref={sceneRef} className="relative h-full w-full flex items-center justify-center">
        <div className="relative h-[80%] w-full max-w-sm">
          
          {/* 1. CARTE PRÉCÉDENTE (Fond de pile) */}
          {prev && (
            <div className="absolute inset-0 z-10">
              <CardFlip frontSrc={prev.frontSrc} backSrc={prev.backSrc} rot={rot} onFlip={flip} />
            </div>
          )}

          {/* 2. CARTE ACTUELLE */}
          <motion.div 
            className="absolute inset-0 z-20 shadow-2xl" 
            style={{ y: currentY }}
          >
            <CardFlip frontSrc={current.frontSrc} backSrc={current.backSrc} rot={rot} onFlip={flip} priority />
          </motion.div>

          {/* 3. CARTE SUIVANTE (Arrive par dessus) */}
          {next && (
            <motion.div 
              className="absolute inset-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" 
              style={{ y: nextY }}
            >
              <CardFlip frontSrc={next.frontSrc} backSrc={next.backSrc} rot={rot} onFlip={flip} />
            </motion.div>
          )}

          {/* LAYER DE DRAG */}
          <motion.div
            className="absolute inset-0 z-40 touch-none"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            onClick={() => flip(1)}
          />
        </div>
      </div>
    </main>
  );
}