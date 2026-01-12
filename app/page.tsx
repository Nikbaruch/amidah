"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, animate } from "framer-motion";
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

  // Face globale (A/B) conservée entre cartes
  const [rot, setRot] = useState(0);
  const flip = (d: 1 | -1) => setRot((r) => r + d * 180);

  // Verrouillage scroll (expérience app)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  // Précharge next/prev (A+B)
  useEffect(() => {
    const preload = (src: string) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    };
    const next = cards[index + 1];
    const prev = cards[index - 1];
    if (next) {
      preload(next.frontSrc);
      preload(next.backSrc);
    }
    if (prev) {
      preload(prev.frontSrc);
      preload(prev.backSrc);
    }
  }, [index, cards]);

  // --- SWAP INTERACTIF ---
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  // Mesure hauteur de la zone (pour “snap” pile)
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [H, setH] = useState(520);

  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setH(Math.round(rect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasPrev = index > 0;
  const hasNext = index < cards.length - 1;

  const current = cards[index];
  const prev = hasPrev ? cards[index - 1] : null;
  const next = hasNext ? cards[index + 1] : null;

  // Progress bar
  const progress = cards.length <= 1 ? 1 : index / (cards.length - 1);

  async function snapTo(target: "next" | "prev" | "center") {
    if (target === "center") {
      await animate(y, 0, { duration: 0.35, ease: [0.22, 1, 0.36, 1] }).finished;
      return;
    }

    const to = target === "next" ? -H : H;

    await animate(y, to, { duration: 0.28, ease: [0.22, 1, 0.36, 1] }).finished;

    setIndex((i) => clamp(i + (target === "next" ? 1 : -1), cards.length));
    y.set(0);
  }

  // Wheel desktop -> swap (sans drag)
  const wheelAcc = useRef(0);
  const wheelTimer = useRef<number | null>(null);

  function onWheel(e: React.WheelEvent) {
    const dy = e.deltaY;
    if (Math.abs(dy) < 1) return;
    e.preventDefault();

    wheelAcc.current += dy;
    if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => (wheelAcc.current = 0), 180);

    const TH = 90;
    if (wheelAcc.current > TH && hasNext) {
      wheelAcc.current = 0;
      snapTo("next");
    } else if (wheelAcc.current < -TH && hasPrev) {
      wheelAcc.current = 0;
      snapTo("prev");
    }
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-black">
      {/* Fond page */}
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="Fond" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="min-h-dvh p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {/* SCENE */}
          <div
            ref={sceneRef}
            className="relative h-[520px] w-full overflow-hidden"
            onWheel={onWheel}
          >
            {/* CARTE PRÉCÉDENTE (au-dessus) */}
            {prev && (
              <motion.div
                className="absolute inset-0"
                style={{
                  y: y.get() - H, // reste au-dessus et suit le drag
                  pointerEvents: "none",
                }}
              >
                <CardFlip
                  frontSrc={prev.frontSrc}
                  backSrc={prev.backSrc}
                  rot={rot}
                  onFlip={flip}
                />
              </motion.div>
            )}

            {/* CARTE COURANTE (celle que tu pousses) */}
            <motion.div
              className="absolute inset-0"
              style={{ y }}
            >
              <CardFlip
                frontSrc={current.frontSrc}
                backSrc={current.backSrc}
                rot={rot}
                onFlip={flip}
                priority
              />
            </motion.div>

            {/* CARTE SUIVANTE (en dessous) */}
            {next && (
              <motion.div
                className="absolute inset-0"
                style={{
                  y: y.get() + H, // reste en dessous et suit le drag
                  pointerEvents: "none",
                }}
              >
                <CardFlip
                  frontSrc={next.frontSrc}
                  backSrc={next.backSrc}
                  rot={rot}
                  onFlip={flip}
                />
              </motion.div>
            )}

            {/* LAYER DRAG VERTICAL: tu “pousses” la carte */}
            <motion.div
              className="absolute inset-0 z-30"
              style={{ touchAction: "none" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragStart={() => setDragging(true)}
              onDrag={(e, info) => {
                // Limite si on est au début/fin
                const ny = info.offset.y;
                if (!hasPrev && ny > 0) return;
                if (!hasNext && ny < 0) return;
                y.set(ny);
              }}
              onDragEnd={async (_e, info) => {
                setDragging(false);

                const offsetY = info.offset.y;
                const velocityY = info.velocity.y;

                const isSwipeUp = offsetY < 0;
                const isSwipeDown = offsetY > 0;

                const distOK = Math.abs(offsetY) > Math.min(140, H * 0.22);
                const veloOK = Math.abs(velocityY) > 850;

                if ((distOK || veloOK) && isSwipeUp && hasNext) {
                  await snapTo("next");
                  return;
                }
                if ((distOK || veloOK) && isSwipeDown && hasPrev) {
                  await snapTo("prev");
                  return;
                }

                await snapTo("center");
              }}
            />
          </div>

          {/* Barre de progression */}
          <div className="mt-4 flex justify-center">
            <div className="w-[220px] h-[3px] rounded-full bg-white/25 overflow-hidden">
              <motion.div
                className="h-full bg-white"
                style={{ transformOrigin: "0% 50%" }}
                animate={{ scaleX: progress }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
