"use client";

import { motion, AnimatePresence, useAnimate, LayoutGroup } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE, wait, waitFrames, EASE_DEAL, EASE_FLY, EASE_MOVE, EASE_FLIP } from "@/constants/animation";
import { getSpreadLayout } from "@/constants/layouts";
import MiniCardBack from "@/components/ui/MiniCardBack";
import CardBack from "@/components/ui/CardBack";
import Button from "@/components/ui/Button";
import Candle from "@/components/ui/Candle";
import { haptic, playPickSound, playShuffleSound, playFlipSound } from "@/lib/feedback";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Stage = "meditate" | "shuffle" | "dealing" | "pick" | "gather" | "layout";

export default function CardPickScreen() {
  const shuffledDeck = useTarotStore((s) => s.shuffledDeck);
  const pickedCards = useTarotStore((s) => s.pickedCards);
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const flippedCardIds = useTarotStore((s) => s.flippedCardIds);
  const shuffleDeck = useTarotStore((s) => s.shuffleDeck);
  const pickCard = useTarotStore((s) => s.pickCard);
  const unpickCard = useTarotStore((s) => s.unpickCard);
  const flipCard = useTarotStore((s) => s.flipCard);
  const flipAll = useTarotStore((s) => s.flipAll);
  const setPhase = useTarotStore((s) => s.setPhase);

  const pickedSet = useMemo(() => new Set(pickedCards.map(p => p.id)), [pickedCards]);

  const [stage, setStage] = useState<Stage>("meditate");
  const [lottieData, setLottieData] = useState<object | null>(null);
  const triggered = useRef(false);
  const shuffleTimeout = useRef<NodeJS.Timeout | null>(null);
  const [shuffleScope, animateShuffle] = useAnimate();
  const [gridScope, animateGrid] = useAnimate();
  const [layoutScope, animateLayout] = useAnimate();
  const layer2Ref = useRef<HTMLDivElement>(null);

  const layout = selectedSpread ? getSpreadLayout(selectedSpread.id, selectedSpread.cardCount) : null;

  useEffect(() => {
    fetch("/galdrastafur.json").then(r => r.json()).then(setLottieData);
  }, []);

  // ── Reusable shuffle animation ──
  const playShuffle = useCallback(async (
    arr: Element[],
    anim: typeof animateShuffle,
    glowEl: Element | null,
    opts: { scale?: number; rounds?: number } = {}
  ) => {
    const s = opts.scale || 1;
    const rounds = opts.rounds || 2;
    const mid = Math.floor(arr.length / 2);

    await Promise.all(arr.map((c, i) =>
      anim(c, { x: (i - mid) * 24 * s, rotate: (i - mid) * 6, y: Math.abs(i - mid) * 7 * s, opacity: 1 }, { duration: 0.5, ease: EASE })
    ));

    for (let round = 0; round < rounds; round++) {
      const left = arr.slice(0, mid), right = arr.slice(mid);
      await Promise.all([
        ...left.map((c, i) => anim(c, { x: (-45 + i * 4) * s, rotate: -3, y: i * 3 }, { duration: 0.3, ease: EASE })),
        ...right.map((c, i) => anim(c, { x: (45 - i * 4) * s, rotate: 3, y: i * 3 }, { duration: 0.3, ease: EASE })),
      ]);
      const order: Element[] = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < right.length) order.push(right[i]);
        if (i < left.length) order.push(left[i]);
      }
      for (let j = 0; j < order.length; j++) {
        anim(order[j], { x: 0, y: -j * 2, rotate: (Math.random() - 0.5) * 3 }, { duration: 0.1, ease: "easeOut" });
        await wait(35);
      }
      await wait(120);
    }

    await Promise.all(arr.map((c, i) => {
      const angle = ((i - mid) / Math.max(mid, 1)) * 0.55;
      const r = 85 * s;
      return anim(c, { x: Math.sin(angle) * r, y: -Math.cos(angle) * r + r - 15, rotate: (i - mid) * 10, scale: 0.85 * s }, { duration: 0.45, ease: EASE });
    }));
    await wait(180);

    await Promise.all(arr.map((c, i) =>
      anim(c, { x: 0, y: -i * 2, rotate: 0, scale: s }, { duration: 0.35, ease: EASE, delay: i * 0.025 })
    ));

    if (glowEl) {
      await anim(glowEl, { opacity: [0, 0.45, 0], scale: [0.7, 1.3, 1.5] }, { duration: 0.45, ease: "easeOut" });
    }
  }, []);

  // ══════ SHUFFLE → DEAL → READY ══════
  const runSequence = useCallback(async () => {
    shuffleDeck();
    const deckCards = shuffleScope.current?.querySelectorAll(".shuf-card");
    if (!deckCards) { setStage("pick"); return; }
    const arr = Array.from(deckCards) as Element[];
    const mid = 3;

    // PHASE 1: Shuffle
    const glow = shuffleScope.current?.querySelector(".glow-ring");
    await playShuffle(arr, animateShuffle, glow, { scale: 1, rounds: 2 });

    // PHASE 2: Move deck to top
    await Promise.all(arr.map((c, i) =>
      animateShuffle(c, { x: 0, y: -130 - i * 1.5, scale: 0.35, rotate: (i - mid) * 0.3 }, { duration: 0.5, ease: EASE_MOVE })
    ));

    // PHASE 3: Deal cards from deck to grid

    // Step A: Hide all grid cards via DOM BEFORE making grid visible (prevents flash)
    const preGridCards = gridScope.current?.querySelectorAll(".deal-card");
    if (preGridCards) {
      preGridCards.forEach((c: Element) => {
        (c as HTMLElement).style.opacity = "0";
        (c as HTMLElement).style.transform = "scale(0.3)";
      });
    }

    // Step B: NOW make grid visible (cards already hidden = no flash)
    setStage("dealing");

    // Step C: Wait for layout to settle
    await waitFrames();
    await wait(50);

    const gridCards = gridScope.current?.querySelectorAll(".deal-card");
    if (!gridCards) { setStage("pick"); return; }
    const gridArr = Array.from(gridCards) as HTMLElement[];

    // Step D: Get REAL deck position for spatial continuity
    const deckEl = shuffleScope.current;
    let deckCenterX = 0, deckCenterY = 0;
    if (deckEl) {
      const dr = deckEl.getBoundingClientRect();
      deckCenterX = dr.left + dr.width / 2;
      deckCenterY = dr.top + dr.height / 2;
    }

    // Step E: Position all cards at deck location via framer-motion
    await Promise.all(gridArr.map((c) => {
      const cr = c.getBoundingClientRect();
      const ox = deckCenterX - cr.left - cr.width / 2;
      const oy = deckCenterY - cr.top - cr.height / 2;
      return animateGrid(c, { opacity: 0, x: ox, y: oy, scale: 0.3, rotate: 0 }, { duration: 0 });
    }));
    await wait(20);

    // Step F: Deal each card — flies FROM deck TO its grid cell
    for (let i = 0; i < gridArr.length; i++) {
      const card = gridArr[i];

      // Deck flick
      const deckCardIdx = Math.floor((arr.length * (gridArr.length - i)) / gridArr.length);
      const topCard = arr[Math.min(deckCardIdx, arr.length - 1)];
      if (topCard) {
        animateShuffle(topCard, { y: -136, rotate: -3, scale: 0.28 }, { duration: 0.03 });
        animateShuffle(topCard, { y: -130 - deckCardIdx * 1.5, rotate: 0, scale: 0.35 }, { duration: 0.06 });
      }

      // Remove deck layers
      if (i > 0 && i % 5 === 0) {
        const removeIdx = arr.length - 1 - Math.floor(i / 5);
        if (removeIdx >= 0 && arr[removeIdx]) {
          animateShuffle(arr[removeIdx], { opacity: 0, scale: 0.1, y: -140 }, { duration: 0.2 });
        }
      }

      // Card flies from deck position to grid position (fire & forget, don't await)
      animateGrid(card, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }, { duration: 0.25, ease: EASE_DEAL });

      await wait(12);
    }

    // Deck fades
    await Promise.all(arr.map((c) =>
      animateShuffle(c, { opacity: 0, scale: 0.05 }, { duration: 0.2 })
    ));

    await wait(150);
    setStage("pick");
  }, [shuffleDeck, shuffleScope, animateShuffle, gridScope, animateGrid, playShuffle]);

  // User taps deck → start shuffle
  const handleTapDeck = useCallback(() => {
    if (stage !== "meditate") return;
    setStage("shuffle");
    playShuffleSound();
    haptic("medium");
    shuffleTimeout.current = setTimeout(runSequence, 100);
  }, [stage, runSequence]);

  // ══════ GATHER → DEAL TO POSITIONS ══════
  const runGatherLayout = useCallback(async () => {
    if (!layout || !selectedSpread) return;
    const pos = layout.positions;

    // Step 1: Wait a moment for the last card's layoutId animation to settle
    await wait(350);

    // Step 2: Fade out grid + preview strip simultaneously
    const gridCards = gridScope.current?.querySelectorAll(".deal-card");
    if (gridCards) {
      const gc = Array.from(gridCards) as HTMLElement[];
      for (let i = 0; i < gc.length; i++) {
        animateGrid(gc[i], { opacity: 0, scale: 0.85 }, { duration: 0.15, delay: i * 0.003 });
      }
    }
    await wait(200);

    // Step 3: Switch to gather (Layer 2 stays opacity:0 via inline style — no flash)
    setStage("gather");
    await waitFrames();
    await wait(30);

    const container = layoutScope.current;
    const cards = container?.querySelectorAll(".layout-card");
    if (!cards || !container) { setStage("layout"); return; }
    const arr = Array.from(cards) as HTMLElement[];
    const total = arr.length;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Step 4: Hide all layout cards via DOM (they're already invisible via container, but be safe)
    for (const c of arr) {
      (c as HTMLElement).style.opacity = "0";
    }

    // Step 5: Now reveal Layer 2 container (cards are hidden inside = no flash)
    if (layer2Ref.current) {
      layer2Ref.current.style.opacity = "1";
    }
    await wait(20);

    const cardPositions = pos.map((lp) => ({
      px: (parseFloat(lp.x) / 100) * cw,
      py: (parseFloat(lp.y) / 100) * ch,
    }));
    // Deck position: top-right corner
    const deckX = cw - 35;
    const deckY = 10;

    // Init all at final positions, offset to deck corner
    await Promise.all(arr.map((c, i) => {
      const cp = cardPositions[i] || { px: deckX, py: deckY };
      c.style.left = `${cp.px}px`;
      c.style.top = `${cp.py}px`;
      return animateLayout(c, {
        opacity: 0, scale: 0.3,
        x: deckX - cp.px, y: deckY - cp.py,
        rotate: 0,
      }, { duration: 0 });
    }));
    await wait(50);

    // Gather: cards fly to top-right stack one by one
    for (let i = 0; i < total; i++) {
      const cp = cardPositions[i] || { px: deckX, py: deckY };
      await animateLayout(arr[i], {
        opacity: 1, scale: 0.8,
        x: deckX - cp.px + (i - (total - 1) / 2) * 2,
        y: deckY - cp.py - i * 2,
      }, { duration: 0.2, ease: [0.0, 0.7, 0.3, 1.0] });
      await wait(25);
    }
    await wait(300);

    // Glow at deck position
    const glowEl = container.querySelector(".gather-glow");
    if (glowEl) {
      (glowEl as HTMLElement).style.left = `${deckX}px`;
      (glowEl as HTMLElement).style.top = `${deckY + 30}px`;
      await animateLayout(glowEl as Element, { opacity: [0, 0.5, 0], scale: [0.5, 1.3, 1.5] }, { duration: 0.4, ease: "easeOut" });
    }
    await wait(150);

    // Deal from top-right to positions one by one
    setStage("layout");
    await wait(60);

    for (let i = 0; i < total; i++) {
      const lp = pos[i] || { x: "50%", y: "50%" };
      const rotate = lp.rotate || 0;
      const cp = cardPositions[i] || { px: deckX, py: deckY };

      // Flick from stack
      await animateLayout(arr[i], {
        x: deckX - cp.px, y: deckY - cp.py - 8,
        scale: 0.5, rotate: -3,
      }, { duration: 0.05 });

      // Fly to position
      animateLayout(arr[i], {
        x: 0, y: 0, scale: 1, rotate: 0,
      }, { duration: 0.35, ease: EASE_FLY });

      // Rotate crossed cards
      if (rotate) {
        const flipDiv = arr[i].querySelector(".flip-inner");
        if (flipDiv) {
          animateLayout(flipDiv as Element, { rotateZ: rotate }, { duration: 0.3 });
        }
      }

      await wait(55);
    }

    await wait(400);
  }, [layout, selectedSpread, gridScope, animateGrid, layoutScope, animateLayout]);

  useEffect(() => {
    if (!selectedSpread || !layout) return;
    if (pickedCards.length === selectedSpread.cardCount && !triggered.current) {
      triggered.current = true;
      runGatherLayout();
    }
  }, [pickedCards.length, selectedSpread, layout, runGatherLayout]);

  useEffect(() => () => { triggered.current = false; }, []);
  useEffect(() => () => { if (shuffleTimeout.current) clearTimeout(shuffleTimeout.current); }, []);

  // Keep Layer 2 visible during layout (prevent re-render from resetting opacity)
  // During gather, the imperative runGatherLayout controls visibility
  useEffect(() => {
    if (layer2Ref.current && stage === "layout") {
      layer2Ref.current.style.opacity = "1";
    }
  }, [stage]);

  if (!selectedSpread || !layout) return null;

  const remaining = selectedSpread.cardCount - pickedCards.length;
  const isFull = pickedCards.length >= selectedSpread.cardCount;
  const { cardW, cardH, positions, aspectRatio } = layout;
  const allFlipped = flippedCardIds.size === pickedCards.length && pickedCards.length > 0;
  const isCardPhase = stage === "gather" || stage === "layout";
  const isPickable = stage === "pick";
  const showGrid = stage === "dealing" || stage === "pick";
  const showDeck = stage === "meditate" || stage === "shuffle" || stage === "dealing";

  return (
    <motion.div key="fan" className="flex flex-col items-center h-full px-3 pb-3"
      initial={{ opacity: 1 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Header */}
      <div className="text-center py-2 flex-shrink-0 w-full min-h-[48px]">
        <AnimatePresence mode="wait">
          {stage === "meditate" && (
            <motion.div key="h-med" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.5 }}>
              <p className="text-white/35 text-xs leading-6">หลับตา... หายใจลึกๆ</p>
              <p className="text-white/35 text-xs leading-6">นึกถึงคำถามในใจของคุณ</p>
              <p className="text-gold/70 font-semibold text-sm mt-2">แตะที่กองไพ่เมื่อพร้อม</p>
            </motion.div>
          )}
          {stage === "shuffle" && (
            <motion.div key="h-shuf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.3, delay: 0.1 }}>
              <p className="text-gold font-semibold text-sm">กำลังสับไพ่...</p>
            </motion.div>
          )}
          {stage === "dealing" && (
            <motion.div key="h-deal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} transition={{ duration: 0.2 }}>
              <p className="text-gold font-semibold text-sm">กำลังแจกไพ่...</p>
            </motion.div>
          )}
          {isPickable && (
            <motion.div key="h-pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <p className="text-gold font-semibold text-sm">
                {remaining > 0 ? `เลือกอีก ${remaining} ใบ` : "เลือกครบแล้ว!"}
              </p>
              <div className="flex justify-center gap-1 mt-1.5">
                {Array.from({ length: selectedSpread.cardCount }, (_, i) => (
                  <div key={i} className={`w-[6px] h-[6px] rounded-full ${i < pickedCards.length ? "bg-gold" : "bg-white/15"}`} />
                ))}
              </div>
            </motion.div>
          )}
          {stage === "gather" && (
            <motion.div key="h-gath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-gold font-semibold text-sm">กำลังเตรียมวางไพ่...</p>
            </motion.div>
          )}
          {stage === "layout" && (
            <motion.div key="h-lay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <p className="text-gold font-semibold text-sm mb-0.5">{selectedSpread.nameTH}</p>
              <p className="text-gold/25 text-xs">แตะไพ่เพื่อเปิด</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview strip */}
      <LayoutGroup>
        <motion.div className="flex gap-1.5 justify-center flex-wrap mb-2 flex-shrink-0 min-h-0"
          animate={{ opacity: isPickable && pickedCards.length > 0 ? 1 : 0, height: isPickable && pickedCards.length > 0 ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: isPickable ? "auto" : "none", overflow: "hidden" }}
        >
          {pickedCards.map((card, i) => (
            <motion.button key={card.id} type="button" layoutId={`card-${card.id}`}
              className="relative flex-shrink-0 rounded-md overflow-hidden"
              onClick={() => unpickCard(card.id)}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <MiniCardBack width={30} height={46} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gold/70 border border-gold flex items-center justify-center">
                  <span className="text-[0.45rem] text-[#08090e] font-bold">{i + 1}</span>
                </div>
              </div>
            </motion.button>
          ))}
          {isPickable && pickedCards.length > 0 && (
            <p className="w-full text-center text-white/20 text-[0.5rem] mt-0.5">แตะเพื่อยกเลิก</p>
          )}
        </motion.div>

        {/* MAIN AREA — all layers stacked */}
        <div className="flex-1 min-h-0 w-full relative">

          {/* Layer 0: Shuffle deck + candles + rune */}
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-20"
            animate={{ opacity: showDeck ? 1 : 0 }}
            transition={{ duration: showDeck ? 0 : 0.25 }}
            style={{ pointerEvents: stage === "meditate" ? "auto" : "none" }}
          >
            {/* Deck + Rune (centered) */}
            <div className="relative" style={{ maxWidth: 280, width: "75vw", height: 340 }}>

              {/* Rune circle — BEHIND everything, centered on deck */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: 340, height: 340,
                  left: "50%", top: "50%",
                  marginLeft: -170, marginTop: -170,
                  zIndex: 1,
                }}
                animate={stage === "meditate"
                  ? { opacity: [0.2, 0.55, 0.2], rotate: [0, 360] }
                  : { opacity: 0 }}
                transition={stage === "meditate"
                  ? { opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }
                  : { duration: 0.3 }}
              >
                {lottieData && <Lottie
                  animationData={lottieData}
                  loop autoplay
                  style={{ width: "100%", height: "100%", filter: "sepia(1) hue-rotate(10deg) brightness(2) opacity(0.6)" }}
                />}
              </motion.div>

              {/* Deck container for shuffle animation */}
              <motion.div
                ref={shuffleScope}
                className={`absolute inset-0 ${stage === "meditate" ? "cursor-pointer" : ""}`}
                style={{ zIndex: 5, overflow: "visible" }}
                onClick={handleTapDeck}
                whileTap={stage === "meditate" ? { scale: 0.96 } : {}}
              >
                <div className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full opacity-0"
                  style={{ background: "radial-gradient(circle, rgba(232,212,139,0.18) 0%, transparent 70%)" }}
                />

                {/* Sparkle shimmer on deck */}
                <motion.div
                  className="absolute rounded-xl pointer-events-none"
                  style={{
                    width: 164, height: 260,
                    left: "50%", top: "50%",
                    marginLeft: -82, marginTop: -130,
                    zIndex: 20,
                    background: "linear-gradient(135deg, transparent 30%, rgba(232,212,139,0.15) 50%, transparent 70%)",
                    backgroundSize: "200% 200%",
                  }}
                  animate={stage === "meditate"
                    ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"], opacity: [0, 0.8, 0] }
                    : { opacity: 0 }}
                  transition={stage === "meditate"
                    ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }}
                />

                {/* Deck edge glow pulse */}
                <motion.div
                  className="absolute rounded-xl pointer-events-none"
                  style={{
                    width: 164, height: 260,
                    left: "50%", top: "50%",
                    marginLeft: -82, marginTop: -130,
                    zIndex: 19,
                    border: "1px solid rgba(232,212,139,0.1)",
                  }}
                  animate={stage === "meditate"
                    ? { boxShadow: ["0 0 8px 2px rgba(232,212,139,0.05)", "0 0 25px 8px rgba(232,212,139,0.18)", "0 0 8px 2px rgba(232,212,139,0.05)"] }
                    : { opacity: 0 }}
                  transition={stage === "meditate"
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }}
                />

                {/* Deck cards */}
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="shuf-card absolute left-1/2 top-1/2 will-change-transform"
                    style={{ marginLeft: -80, marginTop: -128, zIndex: 7 - i + 5, filter: `brightness(${1 - i * 0.03})` }}
                  >
                    <CardBack width={140} height={224} />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Candles — below deck, large, 2 sides */}
            <motion.div
              className="flex items-end gap-16 sm:gap-32 mt-3 pointer-events-none"
              animate={stage === "meditate" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Candle scale={0.9} />
              <Candle scale={0.9} />
            </motion.div>
          </motion.div>

          {/* Layer 1: Card grid */}
          <motion.div
            className="absolute inset-0 max-w-full mx-auto overflow-y-auto overflow-x-hidden rounded-xl z-10"
            animate={{ opacity: showGrid ? 1 : 0 }}
            transition={{ duration: showGrid ? 0.05 : 0.4 }}
            style={{ pointerEvents: isPickable ? "auto" : "none" }}
          >
            <div ref={gridScope} className="grid grid-cols-6 sm:grid-cols-9 gap-[5px] p-1.5">
              {shuffledDeck.map((card, deckIndex) => {
                const isPicked = pickedSet.has(card.id);
                const isDisabled = isFull && !isPicked;

                return (
                  <motion.button key={card.id} type="button"
                    className={`deal-card relative aspect-[5/8] rounded-md overflow-hidden ${
                      isDisabled ? "opacity-15" : ""
                    }`}
                    disabled={stage !== "pick"}
                    whileTap={isPickable && !isPicked && !isDisabled ? { scale: 0.9 } : {}}
                    onClick={() => {
                      if (stage !== "pick") return;
                      if (isPicked) { unpickCard(card.id); haptic("light"); }
                      else if (!isDisabled) { pickCard(deckIndex); haptic("medium"); playPickSound(); }
                    }}
                  >
                    {isPicked ? (
                      <div className="w-full h-full rounded-md bg-gold/[0.04] border border-gold/[0.06] flex items-center justify-center">
                        <span className="text-gold/20 text-lg">✦</span>
                      </div>
                    ) : (
                      <motion.div layoutId={isPickable ? `card-${card.id}` : undefined} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                        <MiniCardBack width={38} height={60} className="w-full h-full" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Layer 2: Gather + Layout — opacity controlled ONLY by ref, never by framer-motion */}
          <div ref={layer2Ref} data-layer2 className="absolute inset-0 flex items-center justify-center z-10"
            style={{ opacity: 0, pointerEvents: isCardPhase ? "auto" : "none" }}
          >
            <div ref={layoutScope} className="relative w-full max-w-[400px]" style={{ aspectRatio: `1 / ${aspectRatio}` }}>
              <div className="gather-glow absolute w-32 h-32 rounded-full pointer-events-none opacity-0"
                style={{ background: "radial-gradient(circle, rgba(232,212,139,0.25) 0%, transparent 70%)", right: 0, top: 0, transform: "translate(20%, -20%)" }}
              />

              {pickedCards.map((card, i) => {
                const posInfo = selectedSpread.positions[i];
                const lp = positions[i] || { x: "50%", y: "50%" };
                const rotate = lp.rotate || 0;
                const isFlipped = flippedCardIds.has(i);

                return (
                  <div key={card.id}
                    className={`layout-card absolute [perspective:600px] ${stage === "layout" ? "cursor-pointer" : ""}`}
                    style={{
                      width: cardW, height: cardH,
                      marginLeft: -cardW / 2, marginTop: -cardH / 2,
                      zIndex: 10 + i,
                    }}
                    onClick={stage === "layout" ? () => { flipCard(i); playFlipSound(); haptic("light"); } : undefined}
                  >
                    <motion.div className="flip-inner w-full h-full relative [transform-style:preserve-3d]"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.75, ease: EASE_FLIP }}
                    >
                      <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                        <MiniCardBack width={cardW} height={cardH} />
                      </div>
                      <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-gold/30 overflow-hidden bg-[#1e0c0c] shadow-[0_2px_12px_rgba(0,0,0,0.4)] ${card.isReversed ? "rotate-180" : ""}`}>
                        {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <p className="text-[0.5rem] text-gold text-center truncate">{card.nameTh}</p>
                          {card.isReversed && <p className="text-[0.45rem] text-red-400/70 text-center">กลับหัว</p>}
                        </div>
                      </div>
                    </motion.div>

                    <motion.p className="text-[0.5rem] text-white/30 text-center mt-1 truncate w-full"
                      style={rotate ? { transform: `rotate(${-rotate}deg)` } : undefined}
                      initial={{ opacity: 0 }} animate={{ opacity: stage === "layout" ? 1 : 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >{posInfo?.nameTH}</motion.p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </LayoutGroup>

      {/* Hint */}
      {isPickable && pickedCards.length === 0 && (
        <motion.p className="text-gold/25 text-[0.6rem] mt-2 flex-shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
        >แตะไพ่ที่คุณรู้สึกสัมผัสได้</motion.p>
      )}

      {/* Layout buttons */}
      <motion.div className="flex gap-3 mt-4 flex-shrink-0"
        animate={{ opacity: stage === "layout" ? 1 : 0, y: stage === "layout" ? 0 : 15 }}
        transition={{ delay: stage === "layout" ? pickedCards.length * 0.15 + 0.8 : 0, duration: 0.5, ease: EASE }}
        style={{ pointerEvents: stage === "layout" ? "auto" : "none" }}
      >
        {!allFlipped && (
          <Button variant="outline" onClick={flipAll}>เปิดทั้งหมด</Button>
        )}
        {allFlipped && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button onClick={() => setPhase("reading")}>อ่านคำทำนาย</Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
