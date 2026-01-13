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

  // Face globale conservée entre cartes (A/B)
  const [rot, setRot] = useState(0);
  const flip = (d: 1 | -1) => setRot((r) => r + d * 180);

  // Expérience “app”: pas de scroll page
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

  // Préchargement next/prev (A+B)
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

  // Mesure hauteur de scène
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [H, setH] = useState(520);
  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;
    const ro = new ResizeObserver(() => setH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Swap “poussé”
  const y = useMotionValue(0);

  // GAP = garantit qu’on ne voit JAMAIS une autre carte au repos
  const GAP = 140;
  const OFF = H + GAP;

  // Positions réactives (important: pas de y.get())
  const prevY = useTransform(y, (v) => v - OFF);
  const nextY = useTransform(y, (v) => v + OFF);

  // Un petit fade-in uniquement quand on commence à tirer
  const absY = useTransform(y, (v) => Math.abs(v));
  const neighborOpacity = useTransform(absY, [0, 18, 80], [0, 0, 1]); // invisible au repos

  // Direction pour la superposition (qui passe au-dessus)
  const [dragDir, setDragDir] = useState<"next" | "prev" | null>(null);
  useMotionValueEvent(y, "change", (v) => {
    if (v < -2) setDragDir("next");
    else if (v > 2) setDragDir("prev");
    else setDragDir(null);
  });

  // Lock d’axe: horizontal = flip, vertical = swap
  const axisLock = useRef<"x" | "y" | null>(null);

  const current = cards[index];
  const prev = hasPrev ? cards[index - 1] : null;
  const next = hasNext ? cards[index + 1] : null;

  async function snapTo(target: "next" | "prev" | "center") {
    if (target === "center") {
      await animate(y, 0, { duration: 0.35, ease: [0.22, 1, 0.36, 1] }).finished;
      return;
    }

    const to = target === "next" ? -OFF : OFF;
    await animate(y, to, { duration: 0.30, ease: [0.22, 1, 0.36, 1] }).finished;

    setIndex((i) => clamp(i + (target === "next" ? 1 : -1), cards.length));
    y.set(0);
  }

  function onDragStart() {
    axisLock.current = null;
  }

  function onDrag(_e: unknown, info: PanInfo) {
    const ox = info.offset.x;
    const oy = info.offset.y;

    if (!axisLock.current) {
      const ax = Math.abs(ox);
      const ay = Math.abs(oy);
      if (ax > 8 || ay > 8) axisLock.current = ax > ay ? "x" : "y";
    }

    if (axisLock.current === "y") {
      if (!hasPrev && oy > 0) return;
      if (!hasNext && oy < 0) return;
      y.set(oy);
    }
  }

  async function onDragEnd(_e: unknown, info: PanInfo) {
    const ox = info.offset.x;
    const oy = info.offset.y;
    const vx = info.velocity.x;
    const vy = info.velocity.y;

    // Horizontal => flip
    if (axisLock.current === "x") {
      const swipePowerX = Math.abs(ox) * Math.abs(vx);
      const ok = Math.abs(ox) > 45 || swipePowerX > 650;
      if (ok) flip(ox < 0 ? 1 : -1);
      return;
    }

    // Vertical => swap
    const distOK = Math.abs(oy) > Math.min(150, H * 0.24);
    const veloOK = Math.abs(vy) > 850;

    if ((distOK || veloOK) && oy < 0 && hasNext) {
      await snapTo("next");
      return;
    }
    if ((distOK || veloOK) && oy > 0 && hasPrev) {
      await snapTo("prev");
      return;
    }

    await snapTo("center");
  }

  // Desktop: wheel/trackpad => change de carte
  const wheelAcc = useRef(0);
  const wheelTimer = useRef<number | null>(null);

  function onWheel(e: React.WheelEvent) {
    const dy = e.deltaY;
    if (Math.abs(dy) < 1) return;

    e.preventDefault();
    wheelAcc.current += dy;

    if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => (wheelAcc.current = 0), 170);

    const TH = 90;
    if (wheelAcc.current > TH && hasNext) {
      wheelAcc.current = 0;
      snapTo("next");
    } else if (wheelAcc.current < -TH && hasPrev) {
      wheelAcc.current = 0;
      snapTo("prev");
    }
  }

  // Clavier: ←/→ flip ; ↑/↓ swap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        flip(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        flip(-1);
      } else if (e.key === "ArrowUp" && hasPrev) {
        e.preventDefault();
        snapTo("prev");
      } else if (e.key === "ArrowDown" && hasNext) {
        e.preventDefault();
        snapTo("next");
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasPrev, hasNext, H]);

  // Progress bar 0..1
  const progress = cards.length <= 1 ? 1 : index / (cards.length - 1);

  // Superposition: celle vers laquelle on va passe au-dessus
  const zPrev = dragDir === "prev" ? 3 : 1;
  const zNext = dragDir === "next" ? 3 : 1;

  return (
    <main className="relative min-h-dvh w-full bg-black">
      {/* Fond page */}
      <div className="absolute inset-0 -z-10">
        <Image src="/images/fond.png" alt="Fond" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="min-h-dvh p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div ref={sceneRef} className="relative h-[520px] w-full" onWheel={onWheel}>
            {/* PREV (hors écran au repos) */}
            {prev && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ y: prevY, opacity: neighborOpacity, zIndex: zPrev }}
              >
                <CardFlip frontSrc={prev.frontSrc} backSrc={prev.backSrc} rot={rot} onFlip={flip} />
              </motion.div>
            )}

            {/* CURRENT */}
            <motion.div className="absolute inset-0" style={{ y, zIndex: 2 }}>
              <CardFlip
                frontSrc={current.frontSrc}
                backSrc={current.backSrc}
                rot={rot}
                onFlip={flip}
                priority
              />
            </motion.div>

            {/* NEXT (hors écran au repos) */}
            {next && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ y: nextY, opacity: neighborOpacity, zIndex: zNext }}
              >
                <CardFlip frontSrc={next.frontSrc} backSrc={next.backSrc} rot={rot} onFlip={flip} />
              </motion.div>
            )}

            {/* Gesture layer unique: vertical=swap / horizontal=flip */}
            <motion.div
              className="absolute inset-0 z-30"
              style={{ touchAction: "none" }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragStart={onDragStart}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              onClick={() => flip(1)}
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
