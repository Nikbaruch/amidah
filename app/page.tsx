"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CardFlip from "@/components/CardFlip";

type CardData = { id: string; frontSrc: string; backSrc: string };
type Dir = 1 | -1;

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
  const [dir, setDir] = useState<Dir>(1);

  // face globale (A/B) conservée entre cartes
  const [rot, setRot] = useState(0);
  const flip = (fdir: 1 | -1) => setRot((r) => r + fdir * 180);

  function go(d: Dir) {
    setDir(d);
    setIndex((i) => clamp(i + d, cards.length));
  }

  // verrouillage scroll
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

  // wheel desktop => change de carte
  const wheelAcc = useRef(0);
  const wheelTimer = useRef<number | null>(null);

  function onWheel(e: React.WheelEvent) {
    const dy = e.deltaY;
    if (Math.abs(dy) < 1) return;

    e.preventDefault();
    wheelAcc.current += dy;

    if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => {
      wheelAcc.current = 0;
    }, 220);

    const TH = 110;
    if (wheelAcc.current > TH) {
      wheelAcc.current = 0;
      go(1);
    } else if (wheelAcc.current < -TH) {
      wheelAcc.current = 0;
      go(-1);
    }
  }

  const current = cards[index];

  // slide plus lent + ease
  const variants = {
    enter: (d: Dir) => ({
      y: d === 1 ? 96 : -96,
      opacity: 0,
      scale: 0.992,
      zIndex: d === 1 ? 0 : 2,
    }),
    center: { y: 0, opacity: 1, scale: 1, zIndex: 1 },
    exit: (d: Dir) => ({
      y: d === 1 ? -56 : 56,
      opacity: 0,
      scale: 0.992,
      zIndex: d === 1 ? 2 : 0,
    }),
  } as const;

  // ✅ Progression (0..1)
  const progress = cards.length <= 1 ? 1 : index / (cards.length - 1);

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-black">
      {/* Fond image */}
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="Fond" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="min-h-dvh p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="relative h-[520px] w-full" onWheel={onWheel}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={current.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <CardFlip
                  frontSrc={current.frontSrc}
                  backSrc={current.backSrc}
                  rot={rot}
                  onFlip={flip}
                  onPrev={() => go(-1)}
                  onNext={() => go(1)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ✅ BARRE DE PROGRESSION */}
          <div className="mt-10 flex justify-center">
            <div className="w-[220px] h-[7px] rounded-full bg-white/10 overflow-hidden">
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
