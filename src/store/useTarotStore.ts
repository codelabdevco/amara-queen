import { create } from "zustand";
import { Phase, ServiceType, Topic, Spread, TarotCard, PickedCard, SPREADS, TOPIC_DEFAULT_SPREAD } from "@/types/tarot";
import { GYPSY_SPREADS, GYPSY_TOPIC_DEFAULT_SPREAD } from "@/types/gypsy";

export interface AIReading {
  trend: "very_positive" | "positive" | "neutral" | "caution" | "challenging";
  trendText: string;
  summary: string;
  advice: string;
  cardInsights: string[];
}
import { allTarotCards } from "@/data/tarot";
import { allGypsyCards } from "@/data/gypsy";
import { shuffleArray } from "@/lib/utils";

interface TarotState {
  service: ServiceType;
  phase: Phase;
  selectedTopic: Topic | null;
  setService: (s: ServiceType) => void;
  selectedSpread: Spread | null;
  userQuestion: string;
  shuffledDeck: TarotCard[];
  pickedCards: PickedCard[];
  flippedCardIds: Set<number>;
  aiReading: AIReading | null;
  isLoadingAI: boolean;
  setPhase: (p: Phase) => void;
  selectTopic: (t: Topic) => void;
  selectSpread: (s: Spread) => void;
  setQuestion: (q: string) => void;
  shuffleDeck: () => void;
  pickCard: (deckIndex: number) => void;
  unpickCard: (cardId: number) => void;
  flipCard: (posIndex: number) => void;
  flipAll: () => void;
  setAiReading: (r: AIReading) => void;
  setLoadingAI: (l: boolean) => void;
  reset: () => void;
}

export const useTarotStore = create<TarotState>((set, get) => ({
  service: "tarot" as ServiceType,
  phase: "landing",
  setService: (s) => set({ service: s }),
  selectedTopic: null,
  selectedSpread: null,
  userQuestion: "",
  shuffledDeck: [],
  pickedCards: [],
  flippedCardIds: new Set(),
  aiReading: null,
  isLoadingAI: false,
  setPhase: (p) => set({ phase: p }),

  selectTopic: (t) => {
    const svc = get().service;
    const defaults = svc === "gypsy" ? GYPSY_TOPIC_DEFAULT_SPREAD : TOPIC_DEFAULT_SPREAD;
    const spreads = svc === "gypsy" ? GYPSY_SPREADS : SPREADS;
    const defaultSpreadId = defaults[t.id] || "three";
    const defaultSpread = spreads.find(s => s.id === defaultSpreadId) || spreads[0];
    set({ selectedTopic: t, selectedSpread: defaultSpread, phase: "spread" });
  },

  selectSpread: (s) => set({ selectedSpread: s }),

  setQuestion: (q) => set({ userQuestion: q }),

  shuffleDeck: () => {
    const svc = get().service;
    const cards = svc === "gypsy" ? allGypsyCards : allTarotCards;
    set({ shuffledDeck: shuffleArray(cards) });
  },

  pickCard: (deckIndex) => {
    const state = get();
    const spread = state.selectedSpread;
    if (!spread) return;
    if (state.pickedCards.length >= spread.cardCount) return;

    const card = state.shuffledDeck[deckIndex];
    if (!card) return;
    if (state.pickedCards.some(p => p.id === card.id)) return;

    const picked: PickedCard = {
      ...card,
      positionIndex: state.pickedCards.length,
      isReversed: Math.random() < 0.3,
    };

    const newPicked = [...state.pickedCards, picked];
    set({ pickedCards: newPicked });

    // Don't auto-advance — let TarotFlow handle the gathering animation
  },

  unpickCard: (cardId) => {
    set(state => {
      const newPicked = state.pickedCards
        .filter(p => p.id !== cardId)
        .map((p, i) => ({ ...p, positionIndex: i })); // re-index
      return { pickedCards: newPicked };
    });
  },

  flipCard: (posIndex) => {
    set(state => {
      const newSet = new Set(state.flippedCardIds);
      newSet.add(posIndex);
      return { flippedCardIds: newSet };
    });
  },

  flipAll: () => {
    const state = get();
    const all = new Set(state.pickedCards.map((_, i) => i));
    set({ flippedCardIds: all });
  },

  setAiReading: (r) => set({ aiReading: r, isLoadingAI: false }),
  setLoadingAI: (l) => set({ isLoadingAI: l }),

  reset: () => set({
    service: "tarot" as ServiceType,
    phase: "home",
    selectedTopic: null,
    selectedSpread: null,
    userQuestion: "",
    shuffledDeck: [],
    pickedCards: [],
    flippedCardIds: new Set(),
    aiReading: null,
    isLoadingAI: false,
  }),
}));
