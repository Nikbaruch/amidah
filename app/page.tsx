"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
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

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
  }, []);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [H, setH] = useState(520);
  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;
    const ro = new ResizeObserver(() => setH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const y = useMotionValue(0);

  // Pour l'effet d'empilement : 
  // Si on scrolle vers le haut (y < 0), la carte actuelle ne bouge pas (0).
  // Si on scrolle vers le bas (y > 0), la carte actuelle descend pour révéler celle du dessous.
  const currentY = useTransform(y, (v) => (v < 0 ? 0 : v));

  // La carte suivante (Next) part de H et monte vers 0 quand on tire vers le haut.
  const nextY = useTransform(y, (v) => (v < 0 ? H + v : H));

  // La carte précédente (Prev) est déjà à 0, sous la carte actuelle. 
  // Elle ne bouge pas, c'est la carte actuelle qui s'écarte.
  const prevY = useTransform(y, (v) => 0);

  // Opacité : On ne voit la carte suivante/précédente QUE si on commence à draguer
  const neighborOpacity = useTransform(y, (v) => (v === 0 ? 0 : 1));

  const [dragDir, setDragDir] = useState<"next" | "prev" | null>(null);
  useMotionValueEvent(y, "change", (v) => {
    if (v < -1) setDragDir("next");
    else if (v > 1) setDragDir("prev");
    else setDragDir(null);
  });

  const axisLock = useRef<"x" | "y" | null>(null);
  const current = cards[index];
  const prev = hasPrev ? cards[index - 1] : null;
  const next = hasNext ? cards[index + 1] : null;

  async function snapTo(target: "next" | "prev" | "center") {
    if (target === "center") {
      await animate(y, 0, { duration: 0.3, ease: "easeOut" }).finished;
      return;
    }
    const to = target === "next" ? -H : H;
    await animate(y, to, { duration: 0.3, ease: "easeOut" }).finished;
    setIndex((i) => clamp(i + (target === "next" ? 1 : -1), cards.length));
    y.set(0);
  }

  function onDrag(_e: unknown, info: PanInfo) {
    const ox = info.offset.x;
    const oy = info.offset.y;
    if (!axisLock.current) {
      const ax = Math.abs(ox);
      const ay = Math.abs(oy);
      if (ax > 5 || ay > 5) axisLock.current = ax > ay ? "x" : "y";
    }
    if (axisLock.current === "y") {
      if (!hasPrev && oy > 0) return;
      if (!hasNext && oy < 0) return;
      y.set(oy);
    }
  }

  async function onDragEnd(_e: unknown, info: PanInfo) {
    const oy = info.offset.y;
    const vy = info.velocity.y;

    if (axisLock.current === "x") {
        const ox = info.offset.x;
        if (Math.abs(ox) > 50) flip(ox < 0 ? 1 : -1);
        axisLock.current = null;
        return;
    }

    const swipeThreshold = H * 0.2;
    if (oy < -swipeThreshold || vy < -500) {
      if (hasNext) await snapTo("next"); else await snapTo("center");
    } else if (oy > swipeThreshold || vy > 500) {
      if (hasPrev) await snapTo("prev"); else await snapTo("center");
    } else {
      await snapTo("center");
    }
    axisLock.current = null;
  }

  return (
    <main className="relative min-h-dvh w-full bg-black overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="Fond" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div ref={sceneRef} className="relative h-[550px] w-full">
            
            {/* CARTE PRÉCÉDENTE (en dessous) */}
            {prev && (
              <motion.div 
                className="absolute inset-0" 
                style={{ y: prevY, zIndex: 1, opacity: dragDir === "prev" ? 1 : 0 }}
              >
                <CardFlip frontSrc={prev.frontSrc} backSrc={prev.backSrc} rot={rot} onFlip={flip} />
              </motion.div>
            )}

            {/* CARTE ACTUELLE */}
            <motion.div 
              className="absolute inset-0" 
              style={{ y: currentY, zIndex: 2 }}
            >
              <CardFlip frontSrc={current.frontSrc} backSrc={current.backSrc} rot={rot} onFlip={flip} priority />
            </motion.div>

            {/* CARTE SUIVANTE (empilement par dessus) */}
            {next && (
              <motion.div 
                className="absolute inset-0" 
                style={{ 
                    y: nextY, 
                    zIndex: 3, 
                    opacity: neighborOpacity,
                    boxShadow: "0 -10px 20px rgba(0,0,0,0.3)" 
                }}
              >
                <CardFlip frontSrc={next.frontSrc} backSrc={next.backSrc} rot={rot} onFlip={flip} />
              </motion.div>
            )}

            {/* Zone de contrôle invisible */}
            <motion.div
              className="absolute inset-0 z-40 touch-none"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.05}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              onClick={() => flip(1)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}