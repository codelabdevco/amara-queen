import {
  Heart, Diamond, Star, Settings, Sparkles, Sparkle, Moon, Store, Sun,
  ScrollText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Home, User, Calendar, CalendarCheck, Bookmark, CreditCard, Package, LogOut, Users,
  Receipt, Car, Building2, Hash, Wallet, Clock, Phone,
  Flower2, CircleDot, Zap, Cloud, Check, Lightbulb,
  TriangleAlert, Scale, Briefcase, Compass, BookOpen, HeartPulse,
  Flame, Coins, ShoppingBag, type LucideProps,
} from "lucide-react";
import { type ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  heart: Heart,
  diamond: Diamond,
  star: Star,
  settings: Settings,
  sparkles: Sparkles,
  sparkle: Sparkle,
  moon: Moon,
  store: Store,
  sun: Sun,
  "scroll-text": ScrollText,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  home: Home,
  user: User,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  bookmark: Bookmark,
  "credit-card": CreditCard,
  package: Package,
  "log-out": LogOut,
  users: Users,
  receipt: Receipt,
  car: Car,
  building: Building2,
  hash: Hash,
  wallet: Wallet,
  clock: Clock,
  phone: Phone,
  flower: Flower2,
  briefcase: Briefcase,
  compass: Compass,
  "book-open": BookOpen,
  "heart-pulse": HeartPulse,
  flame: Flame,
  coins: Coins,
  "circle-dot": CircleDot,
  zap: Zap,
  cloud: Cloud,
  check: Check,
  lightbulb: Lightbulb,
  "triangle-alert": TriangleAlert,
  scale: Scale,
  "shopping-bag": ShoppingBag,
};

interface IconProps extends LucideProps {
  name: string;
}

export default function Icon({ name, ...props }: IconProps) {
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp {...props} />;
}

export { ICON_MAP };
