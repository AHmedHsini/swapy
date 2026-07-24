import { useState, type FormEvent, type ReactNode } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Home, ShoppingBag, Cpu, Wrench, Leaf, Users, Bell, MessageSquare,
  Search, Star, MapPin, Package, Heart, RefreshCw, Send, Upload, Mic,
  Award, Zap, Globe, BookOpen, Laptop, Shirt, Filter, Menu, Settings,
  CheckCircle, AlertTriangle, Bookmark, Trophy, Flame, Recycle, Wind,
  DollarSign, Camera, Sparkles, Battery, Plus, Lock, Mail, Eye, EyeOff,
  BarChart2, ShieldCheck, LogOut,
} from "lucide-react";

type Page = "landing" | "login" | "dashboard" | "marketplace" | "product" | "repair" | "sustainability" | "profile";
type UserRole = "ADMIN" | "STUDENT";
type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};
type AuthSession = {
  accessToken: string;
  tokenType: "Bearer";
  user: AuthUser;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";
const AUTH_STORAGE_KEY = "swapy-campus-session";

const getInitials = (user?: AuthUser | null) => {
  if (!user) return "AK";
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "U";
};

const getDisplayName = (user?: AuthUser | null) => {
  if (!user) return "Ahmed Kassem";
  return `${user.firstName} ${user.lastName}`.trim();
};

const readStoredSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as AuthSession : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const clearStoredSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.reload();
};

const apiRequest = async <T,>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Request failed");
  }
  return data as T;
};

// ─── DATA ──────────────────────────────────────────────────────────────────

const co2Data = [
  { month: "Sep", value: 12 }, { month: "Oct", value: 28 },
  { month: "Nov", value: 45 }, { month: "Dec", value: 38 },
  { month: "Jan", value: 62 }, { month: "Feb", value: 78 },
  { month: "Mar", value: 95 }, { month: "Apr", value: 112 },
];

const moneyData = [
  { month: "Sep", value: 240 }, { month: "Oct", value: 580 },
  { month: "Nov", value: 920 }, { month: "Dec", value: 780 },
  { month: "Jan", value: 1240 }, { month: "Feb", value: 1680 },
  { month: "Mar", value: 2100 }, { month: "Apr", value: 2450 },
];

const pieData = [
  { name: "Electronics", value: 35, fill: "#2EC4C3" },
  { name: "Books", value: 28, fill: "#3B82F6" },
  { name: "Clothes", value: 20, fill: "#F59E0B" },
  { name: "Other", value: 17, fill: "#8B5CF6" },
];

const products = [
  { id: 1, name: "MacBook Pro M1 2021", category: "Laptop", condition: "Good", price: 850, seller: "Ahmed K.", rating: 4.8, location: "Block A", img: "1496181133206-80ce9b88a853", type: "sell", score: 88 },
  { id: 2, name: "Arduino Mega 2560 Kit", category: "Electronics", condition: "Like New", price: 25, seller: "Sara M.", rating: 4.9, location: "Lab 3", img: "1553406830-ef2513450d76", type: "exchange", score: 95 },
  { id: 3, name: "Engineering Maths Vol. I–III", category: "Books", condition: "Fair", price: 0, seller: "Karim B.", rating: 4.6, location: "Library", img: "1481627834876-b7833e8f5570", type: "donate", score: 92 },
  { id: 4, name: "Raspberry Pi 4 Starter Kit", category: "Electronics", condition: "Like New", price: 65, seller: "Lina T.", rating: 5.0, location: "Block B", img: "1518770660439-4636190af475", type: "sell", score: 91 },
  { id: 5, name: "Lab Coat + Safety Glasses", category: "Clothes", condition: "Good", price: 15, seller: "Omar D.", rating: 4.7, location: "Block C", img: "1532094348840-53f7a8fd914a", type: "sell", score: 85 },
  { id: 6, name: "Sensor Pack — 40 units", category: "Electronics", condition: "Good", price: 40, seller: "Nour A.", rating: 4.5, location: "Lab 1", img: "1581092918056-0c4c3acd3789", type: "exchange", score: 89 },
];

const chatHistory = [
  { role: "ai", text: "Hello! I am the Swapy AI Repair Assistant. Describe the issue or upload a photo of your device — I'll diagnose it instantly." },
  { role: "user", text: "My Arduino Uno isn't being detected when I plug it in via USB." },
  { role: "ai", text: "Diagnosed! Most likely causes:\n\n1. CH340 USB-Serial driver not installed on your OS\n2. Charge-only USB cable (no data lines)\n3. COM port conflict — check Device Manager\n\nEstimated fix cost: €0 — likely a software issue.\n\nWant me to walk you through the driver installation step by step?" },
];

const leaderboard = [
  { rank: 1, name: "Ahmed Kassem", pts: 2840, badge: "Circular Ambassador", av: "AK", color: "#F59E0B" },
  { rank: 2, name: "Sara Mansour", pts: 2650, badge: "Repair Expert", av: "SM", color: "#2EC4C3" },
  { rank: 3, name: "Lina Tazi", pts: 2210, badge: "Eco Contributor", av: "LT", color: "#3B82F6" },
  { rank: 4, name: "Karim Benali", pts: 1980, badge: "Tech Saver", av: "KB", color: "#8B5CF6" },
  { rank: 5, name: "Omar Diallo", pts: 1750, badge: "Eco Contributor", av: "OD", color: "#10B981" },
];

const navItems = [
  { icon: Home, label: "Dashboard", page: "dashboard" as Page },
  { icon: ShoppingBag, label: "Marketplace", page: "marketplace" as Page },
  { icon: Cpu, label: "Tech Hub", page: "marketplace" as Page },
  { icon: Wrench, label: "AI Repair", page: "repair" as Page },
  { icon: Leaf, label: "Sustainability", page: "sustainability" as Page },
  { icon: Users, label: "Community", page: "dashboard" as Page },
];

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────

type PillColor = "teal" | "blue" | "amber" | "purple" | "green" | "pink";
const pillCls: Record<PillColor, string> = {
  teal: "bg-[#2EC4C3]/15 text-[#2EC4C3]",
  blue: "bg-[#3B82F6]/15 text-[#3B82F6]",
  amber: "bg-[#F59E0B]/15 text-[#F59E0B]",
  purple: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  green: "bg-[#10B981]/15 text-[#10B981]",
  pink: "bg-[#EC4899]/15 text-[#EC4899]",
};

const Pill = ({ children, color = "teal" }: { children: ReactNode; color?: PillColor }) => (
  <span className={`${pillCls[color]} text-[10px] font-semibold px-2 py-0.5 rounded-full`}>{children}</span>
);

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-[#1E293B] border border-white/[0.07] rounded-[18px] ${className}`}>{children}</div>
);

const ProgressRing = ({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) => {
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

const TooltipStyle = { backgroundColor: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11, color: "#fff" };

// ─── APP SHELL ─────────────────────────────────────────────────────────────

const Sidebar = ({ active, nav, collapsed, toggle, user, onLogout }: {
  active: Page; nav: (p: Page) => void; collapsed: boolean; toggle: () => void; user: AuthUser | null; onLogout: () => void;
}) => (
  <aside className={`${collapsed ? "w-[60px]" : "w-[220px]"} flex-shrink-0 h-screen bg-[#080F1C] border-r border-white/[0.06] flex flex-col transition-all duration-300`}>
    <div className="h-[60px] flex items-center px-4 gap-3 border-b border-white/[0.06]">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#1a9fa0] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(46,196,195,0.4)]">
        <Recycle size={13} className="text-white" />
      </div>
      {!collapsed && <span className="text-sm font-bold text-white whitespace-nowrap"><span className="text-[#2EC4C3]">Swapy</span> Campus</span>}
      <button onClick={toggle} className="ml-auto text-white/20 hover:text-white/60 transition-colors">
        <Menu size={14} />
      </button>
    </div>
    <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
      {navItems.map(({ icon: Icon, label, page }) => (
        <button key={label} onClick={() => nav(page)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${active === page ? "bg-[#2EC4C3]/10 text-[#2EC4C3]" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}>
          <Icon size={15} className="flex-shrink-0" />
          {!collapsed && label}
        </button>
      ))}
    </nav>
    <div className="p-2 border-t border-white/[0.06] space-y-0.5">
      {!collapsed && (
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all">
          <Settings size={14} /> Settings
        </button>
      )}
      <button onClick={() => nav("profile")} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{getInitials(user)}</div>
        {!collapsed && (
          <div className="text-left min-w-0">
            <p className="text-xs font-medium text-white truncate">{getDisplayName(user)}</p>
            <p className="text-[10px] text-slate-500">{user?.role === "ADMIN" ? "Admin" : "Student"} account</p>
          </div>
        )}
      </button>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all">
        <LogOut size={14} />
        {!collapsed && "Logout"}
      </button>
    </div>
  </aside>
);

const Topbar = ({ title, nav, user }: { title: string; nav: (p: Page) => void; user: AuthUser | null }) => (
  <header className="h-[60px] border-b border-white/[0.06] flex items-center px-5 gap-3 bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
    <span className="text-sm font-semibold text-white">{title}</span>
    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 ml-2 w-48">
      <Search size={12} className="text-slate-400 flex-shrink-0" />
      <input placeholder="Search..." className="bg-transparent text-xs text-white placeholder:text-slate-500 outline-none flex-1 w-0" />
    </div>
    <div className="ml-auto flex items-center gap-1.5">
      <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
      </button>
      <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]">
        <MessageSquare size={16} />
      </button>
      <button onClick={() => nav("profile")} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center text-[10px] font-bold text-white ml-1">
        {getInitials(user)}
      </button>
    </div>
  </header>
);

const AppLayout = ({ children, active, nav, title, user = readStoredSession()?.user ?? null, onLogout = clearStoredSession }: {
  children: ReactNode; active: Page; nav: (p: Page) => void; title: string; user?: AuthUser | null; onLogout?: () => void;
}) => {
  const [col, setCol] = useState(false);
  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      <Sidebar active={active} nav={nav} collapsed={col} toggle={() => setCol(!col)} user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} nav={nav} user={user} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
};

// ─── 1. LANDING PAGE ──────────────────────────────────────────────────────

const LandingPage = ({ nav }: { nav: (p: Page) => void }) => {
  const features = [
    { icon: ShoppingBag, title: "Smart Marketplace", desc: "Buy, sell, donate, and exchange items with AI-powered pricing suggestions.", color: "#2EC4C3" },
    { icon: Wrench, title: "AI Repair Assistant", desc: "Diagnose hardware issues instantly and get step-by-step repair guidance.", color: "#3B82F6" },
    { icon: Recycle, title: "Circular Exchange", desc: "Swap items across campus buildings and reduce unnecessary waste.", color: "#10B981" },
    { icon: BarChart2, title: "Sustainability Tracking", desc: "Monitor your CO₂ impact, waste reduction, and personal sustainability score.", color: "#F59E0B" },
    { icon: Cpu, title: "Tech Hub", desc: "Find Arduino kits, Raspberry Pi boards, sensors, and electronic components.", color: "#8B5CF6" },
    { icon: Trophy, title: "Gamification", desc: "Earn badges, level up, and compete on the campus sustainability leaderboard.", color: "#EC4899" },
  ];

  const heroItems = [
    { icon: Laptop, label: "MacBook Air M2", sub: "€450 · Block A", color: "#2EC4C3", cls: "top-6 left-4" },
    { icon: BookOpen, label: "Physics Textbooks", sub: "Free · Library", color: "#3B82F6", cls: "top-6 right-4" },
    { icon: Cpu, label: "Arduino Mega", sub: "€25 · Lab 3", color: "#8B5CF6", cls: "bottom-6 right-4" },
    { icon: Shirt, label: "Lab Safety Coat", sub: "€12 · Block C", color: "#F59E0B", cls: "bottom-6 left-4" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-8 h-16 border-b border-white/[0.06] bg-[#0A0F1E]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#1a9fa0] flex items-center justify-center shadow-[0_0_14px_rgba(46,196,195,0.45)]">
            <Recycle size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm"><span className="text-[#2EC4C3]">Swapy</span> Campus</span>
        </div>
        <div className="ml-10 hidden md:flex items-center gap-7 text-sm text-slate-400">
          {["Marketplace", "Features", "Community", "About"].map(l => (
            <button key={l} onClick={() => nav("marketplace")} className="hover:text-white transition-colors">{l}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => nav("login")} className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</button>
          <button onClick={() => nav("login")} className="bg-[#2EC4C3] text-[#0A0F1E] font-bold text-sm px-4 py-2 rounded-full hover:bg-[#2EC4C3]/90 transition-all hover:shadow-[0_0_20px_rgba(46,196,195,0.45)]">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#0A0F1E] to-[#051828]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#2EC4C3]/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-[#3B82F6]/[0.06] blur-[100px] pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2EC4C3]/10 border border-[#2EC4C3]/20 rounded-full px-4 py-1.5 mb-7">
              <Sparkles size={11} className="text-[#2EC4C3]" />
              <span className="text-[#2EC4C3] text-xs font-semibold">AI-Powered Circular Economy Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.06] tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#2EC4C3] to-[#3B82F6] bg-clip-text text-transparent">Reuse.</span>{" "}
              <span className="text-white">Repair.</span>
              <br />
              <span className="text-white">Exchange.</span>{" "}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">Sustain.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-9 max-w-lg">
              The university platform for students to buy, sell, donate, and repair electronics, books, clothes, and project materials — together, sustainably.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => nav("dashboard")}
                className="bg-[#2EC4C3] text-[#0A0F1E] font-bold px-7 py-3.5 rounded-full hover:bg-[#2EC4C3]/90 transition-all shadow-[0_0_30px_rgba(46,196,195,0.4)] text-sm">
                Start Swapping
              </button>
              <button onClick={() => nav("marketplace")}
                className="border border-white/15 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/[0.06] transition-all text-sm">
                Explore Marketplace →
              </button>
            </div>
          </div>

          {/* Right — Illustration */}
          <div className="relative h-[380px] hidden lg:block">
            {/* Glows */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-[#2EC4C3]/10 blur-3xl absolute" />
              <div className="w-52 h-52 rounded-full bg-[#3B82F6]/10 blur-2xl absolute translate-x-10 -translate-y-8" />
            </div>
            {/* Center hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#2EC4C3] to-[#1a9fa0] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(46,196,195,0.5)] z-10">
                <Recycle size={44} className="text-white" />
                <span className="text-white text-[10px] font-bold tracking-widest mt-1">CAMPUS</span>
              </div>
              <div className="absolute w-56 h-56 rounded-full border border-dashed border-[#2EC4C3]/15 pointer-events-none" />
              <div className="absolute w-80 h-80 rounded-full border border-[#3B82F6]/8 pointer-events-none" />
            </div>
            {/* Floating item cards */}
            {heroItems.map(({ icon: Icon, label, sub, color, cls }) => (
              <div key={label} className={`absolute ${cls} bg-[#1E293B]/90 backdrop-blur-sm border border-white/[0.09] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xl z-20`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none mb-0.5">{label}</p>
                  <p className="text-[10px] text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
            {/* Battery sensor card — right middle */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-[#1E293B]/90 backdrop-blur-sm border border-white/[0.09] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xl z-20">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#10B981]/20">
                <Battery size={14} className="text-[#10B981]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-none mb-0.5">Sensor Pack</p>
                <p className="text-[10px] text-slate-400">Exchange · Lab 1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-white/[0.06] bg-[#080E1B]">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Items Reused", value: "12,480+", color: "#2EC4C3" },
            { label: "Money Saved", value: "€124K+", color: "#3B82F6" },
            { label: "CO₂ Avoided", value: "3.2 tons", color: "#10B981" },
            { label: "Active Students", value: "4,200+", color: "#F59E0B" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold mb-1.5" style={{ color }}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything your campus needs</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            One platform for circular economy, AI-powered repair, sustainability tracking, and campus community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-[#1E293B]/40 border border-white/[0.07] rounded-[18px] p-5 hover:border-white/[0.14] transition-all hover:bg-[#1E293B]/70 group cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <div className="bg-gradient-to-r from-[#2EC4C3]/15 to-[#3B82F6]/15 border border-[#2EC4C3]/20 rounded-[24px] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4C3]/5 to-transparent" />
          <h2 className="relative text-2xl font-bold text-white mb-3">Ready to join the circular economy?</h2>
          <p className="relative text-slate-300 text-sm mb-6">Join 4,200+ students already saving money and the planet.</p>
          <button onClick={() => nav("login")}
            className="relative bg-[#2EC4C3] text-[#0A0F1E] font-bold px-8 py-3.5 rounded-full hover:bg-[#2EC4C3]/90 transition-all shadow-[0_0_30px_rgba(46,196,195,0.4)] text-sm">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 bg-[#080E1B]">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center">
              <Recycle size={11} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm"><span className="text-[#2EC4C3]">Swapy</span> Campus</span>
          </div>
          <p className="text-slate-500 text-xs">© 2025 Swapy Campus · Building a circular university economy.</p>
          <div className="flex gap-5 text-xs text-slate-500">
            {["Privacy", "Terms", "Contact"].map(l => <button key={l} className="hover:text-white transition-colors">{l}</button>)}
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── 2. LOGIN PAGE ────────────────────────────────────────────────────────

const LoginPage = ({ nav, onAuthSuccess }: { nav: (p: Page) => void; onAuthSuccess: (session: AuthSession) => void }) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (tab === "register") {
        const [firstName, ...rest] = fullName.trim().split(/\s+/);
        await apiRequest<AuthUser>("/users", {
          firstName: firstName || "New",
          lastName: rest.join(" ") || "User",
          email,
          password,
          role,
        });
      }

      const session = await apiRequest<AuthSession>("/auth/login", { email, password });
      onAuthSuccess(session);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex text-white">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2035] to-[#0a1428]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#2EC4C3]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#3B82F6]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#1a9fa0] flex items-center justify-center shadow-[0_0_14px_rgba(46,196,195,0.4)]">
            <Recycle size={15} className="text-white" />
          </div>
          <span className="font-bold"><span className="text-[#2EC4C3]">Swapy</span> Campus</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Join 4,200+ students building a sustainable campus
          </h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Buy, sell, donate, and repair with your university community. Save money. Save the planet.
          </p>
          <div className="space-y-3">
            {[
              { icon: Recycle, text: "Average student saves €340 per year" },
              { icon: Leaf, text: "112 kg CO₂ avoided monthly across campus" },
              { icon: Trophy, text: "Gamified sustainability rewards and badges" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2EC4C3]/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#2EC4C3]" />
                </div>
                <span className="text-slate-200 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center text-xs font-bold">SM</div>
            <div>
              <p className="text-white text-xs font-semibold">Sara Mansour</p>
              <p className="text-slate-400 text-[10px]">Computer Engineering · Year 3</p>
            </div>
            <div className="ml-auto flex">
              {[1,2,3,4,5].map(i => <Star key={i} size={10} className="text-[#F59E0B] fill-[#F59E0B]" />)}
            </div>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed italic">
            "I saved €280 this semester and got my Arduino diagnosed for free with the AI assistant. Swapy Campus is incredible."
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0A0F1E]">
        <div className="w-full max-w-[340px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#1a9fa0] flex items-center justify-center">
              <Recycle size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm"><span className="text-[#2EC4C3]">Swapy</span> Campus</span>
          </div>

          <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#1E293B] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{tab === "login" ? "Welcome back" : "Create account"}</h2>
          <p className="text-slate-400 text-sm mb-6">{tab === "login" ? "Sign in to your Swapy Campus account" : "Join the campus circular economy today"}</p>

          <button className="w-full flex items-center justify-center gap-3 border border-white/[0.12] rounded-xl py-2.5 text-sm text-white hover:bg-white/[0.04] transition-all mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-slate-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <form onSubmit={submitAuth} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Kassem" className="w-full bg-[#1E293B] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#2EC4C3]/50 transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">University Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student1@gmail.com" className="w-full bg-[#1E293B] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#2EC4C3]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#1E293B] border border-white/[0.08] rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#2EC4C3]/50 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            {tab === "register" && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["STUDENT", "ADMIN"] as const).map((value) => (
                    <button key={value} type="button" onClick={() => setRole(value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all ${role === value ? "border-[#2EC4C3]/60 bg-[#2EC4C3]/10 text-[#2EC4C3]" : "border-white/[0.08] bg-[#1E293B] text-slate-400 hover:text-white"}`}>
                      {value === "ADMIN" ? <ShieldCheck size={13} /> : <Users size={13} />}
                      {value === "ADMIN" ? "Admin" : "Student"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="w-full bg-[#2EC4C3] text-[#0A0F1E] font-bold py-3 rounded-xl text-sm hover:bg-[#2EC4C3]/90 transition-all shadow-[0_0_20px_rgba(46,196,195,0.35)] mt-1 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            {tab === "login" ? "New to Swapy? " : "Already have an account? "}
            <button onClick={() => setTab(tab === "login" ? "register" : "login")} className="text-[#2EC4C3] hover:underline">
              {tab === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
          <button onClick={() => nav("landing")} className="mt-5 text-slate-500 text-xs flex items-center gap-1 hover:text-white transition-colors mx-auto w-fit">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 3. DASHBOARD ─────────────────────────────────────────────────────────

const DashboardPage = ({ nav }: { nav: (p: Page) => void }) => {
  const kpis = [
    { title: "Active Listings", value: "7", change: "+2", icon: Package, color: "#2EC4C3" },
    { title: "Donations Made", value: "12", change: "+3", icon: Heart, color: "#EC4899" },
    { title: "Exchanges", value: "5", change: "+1", icon: RefreshCw, color: "#3B82F6" },
    { title: "Rep Score", value: "4.87", change: "+0.12", icon: Star, color: "#F59E0B" },
  ];
  const activities = [
    { icon: CheckCircle, text: 'Your "Arduino Mega" was sold to Karim B.', time: "2h ago", color: "#10B981" },
    { icon: RefreshCw, text: 'Exchange request from Lina T. for Raspberry Pi', time: "5h ago", color: "#3B82F6" },
    { icon: Heart, text: 'You donated "Engineering Maths Vol.I" to the library', time: "1d ago", color: "#EC4899" },
    { icon: Award, text: 'New badge earned: Repair Expert Level 2', time: "2d ago", color: "#F59E0B" },
  ];

  return (
    <AppLayout active="dashboard" nav={nav} title="Dashboard">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Good morning, Ahmed 👋</h1>
        <p className="text-slate-400 text-xs mt-0.5">Friday, 4 July 2025 · You have 3 pending exchanges</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpis.map(({ title, value, change, icon: Icon, color }) => (
          <Card key={title} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs">{title}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{value}</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">{change} this week</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-semibold">CO₂ Saved Over Time</p>
              <p className="text-slate-400 text-xs">Cumulative kg avoided this academic year</p>
            </div>
            <Pill color="green">112 kg total</Pill>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={co2Data}>
              <defs>
                <linearGradient id="co2g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EC4C3" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2EC4C3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#2EC4C3" fill="url(#co2g)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <p className="text-white text-sm font-semibold mb-3">Recent Activity</p>
          <div className="space-y-3">
            {activities.map(({ icon: Icon, text, time, color }, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-[11px] leading-snug">{text}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Money + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-semibold">Money Saved</p>
              <p className="text-slate-400 text-xs">Cumulative € saved through swaps and donations</p>
            </div>
            <Pill color="amber">€2,450 total</Pill>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={moneyData}>
              <defs>
                <linearGradient id="mnyg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TooltipStyle} formatter={(value) => [`€${value ?? 0}`, "Saved"]} />
              <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="url(#mnyg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-[#2EC4C3]/15">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#2EC4C3]" />
            <p className="text-white text-sm font-semibold">AI Suggestions</p>
          </div>
          <div className="space-y-2">
            {[
              { text: "List your old lab reports — 12 students nearby are looking.", action: "List Now" },
              { text: "Your ESP32 kit is in high demand this semester.", action: "Price Check" },
              { text: "Donate 2 more items to reach Eco Pro Level 3.", action: "Donate" },
            ].map(({ text, action }) => (
              <div key={action} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] hover:border-[#2EC4C3]/20 transition-colors cursor-pointer">
                <p className="text-slate-300 text-[11px] leading-snug mb-1.5">{text}</p>
                <button className="text-[#2EC4C3] text-[10px] font-bold hover:underline">{action} →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

// ─── 4. MARKETPLACE ───────────────────────────────────────────────────────

const typeColor: Record<string, PillColor> = { sell: "teal", exchange: "blue", donate: "green" };
const typeLabel: Record<string, string> = { sell: "Sale", exchange: "Exchange", donate: "Free" };

const MarketplacePage = ({ nav }: { nav: (p: Page) => void }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Electronics", "Books", "Clothes", "Laptops", "Components"];

  return (
    <AppLayout active="marketplace" nav={nav} title="Marketplace">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Campus Marketplace</h2>
          <p className="text-slate-400 text-xs mt-0.5">127 items available on campus right now</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2EC4C3] text-[#0F172A] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#2EC4C3]/90 transition-all shadow-[0_0_14px_rgba(46,196,195,0.3)]">
          <Plus size={13} /> List Item
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === f ? "bg-[#2EC4C3] text-[#0F172A]" : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"}`}>
            {f}
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 border border-white/[0.08] hover:text-white ml-auto transition-colors">
          <Filter size={11} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} onClick={() => nav("product")}
            className="bg-[#1E293B] border border-white/[0.07] rounded-[18px] overflow-hidden cursor-pointer group hover:border-white/[0.14] transition-all hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5">
            <div className="relative h-36 bg-[#111827] overflow-hidden">
              <img src={`https://images.unsplash.com/photo-${p.img}?w=400&h=200&fit=crop&auto=format`}
                alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2">
                <Pill color={typeColor[p.type]}>{typeLabel[p.type]}</Pill>
              </div>
              <button onClick={e => e.stopPropagation()} className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#0F172A]/90">
                <Bookmark size={12} className="text-white" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-semibold mb-0.5 truncate">{p.name}</p>
              <p className="text-slate-400 text-[10px] mb-2">{p.category} · {p.condition}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#2EC4C3] font-bold text-sm">{p.price === 0 ? "Free" : `€${p.price}`}</span>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-slate-300 text-[10px]">{p.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={9} className="text-slate-500" />
                <span className="text-slate-500 text-[10px]">{p.location}</span>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium">♻ {p.score}%</span>
              </div>
            </div>
            <div className="flex border-t border-white/[0.06]">
              <button onClick={e => e.stopPropagation()} className="flex-1 py-2 text-[10px] font-bold text-[#2EC4C3] hover:bg-[#2EC4C3]/10 transition-colors">Buy</button>
              <div className="w-px bg-white/[0.06]" />
              <button onClick={e => e.stopPropagation()} className="flex-1 py-2 text-[10px] font-bold text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors">Exchange</button>
              <div className="w-px bg-white/[0.06]" />
              <button onClick={e => e.stopPropagation()} className="flex-1 py-2 text-[10px] font-bold text-slate-400 hover:bg-white/5 transition-colors">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

// ─── 5. PRODUCT DETAILS ───────────────────────────────────────────────────

const ProductPage = ({ nav }: { nav: (p: Page) => void }) => {
  const [selImg, setSelImg] = useState(0);
  const imgs = ["1496181133206-80ce9b88a853", "1518770660439-4636190af475", "1553406830-ef2513450d76"];

  return (
    <AppLayout active="marketplace" nav={nav} title="Product Details">
      <button onClick={() => nav("marketplace")} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-5 transition-colors">
        ← Back to Marketplace
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Images */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="overflow-hidden h-60">
            <img src={`https://images.unsplash.com/photo-${imgs[selImg]}?w=600&h=400&fit=crop&auto=format`}
              alt="Product" className="w-full h-full object-cover" />
          </Card>
          <div className="flex gap-2">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setSelImg(i)}
                className={`flex-1 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selImg ? "border-[#2EC4C3]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <img src={`https://images.unsplash.com/photo-${img}?w=150&h=100&fit=crop&auto=format`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Sustainability score */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Sustainability Score</p>
                <p className="text-white text-2xl font-extrabold">88 <span className="text-sm font-medium text-slate-400">/ 100</span></p>
                <p className="text-emerald-400 text-[10px] font-medium mt-0.5">Excellent · Saves 23 kg CO₂</p>
              </div>
              <div className="relative flex items-center justify-center">
                <ProgressRing pct={88} color="#2EC4C3" size={56} />
                <Leaf size={13} className="absolute text-[#2EC4C3]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill color="teal">For Sale</Pill>
                  <Pill color="blue">Laptop</Pill>
                  <Pill color="green">Good Condition</Pill>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">MacBook Pro M1 2021</h2>
                <p className="text-slate-400 text-sm">16 GB RAM · 512 GB SSD · Space Gray</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-[#2EC4C3] transition-colors">
                <Bookmark size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= 4 ? "text-[#F59E0B] fill-[#F59E0B]" : "text-slate-600"} />)}
              <span className="text-slate-300 text-xs">4.8 · 36 reviews</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-white">€850</span>
              <span className="text-slate-400 text-sm line-through mb-0.5">€1,299</span>
              <span className="text-emerald-400 text-sm font-bold mb-0.5">35% off</span>
            </div>
          </Card>

          {/* AI Analysis */}
          <Card className="p-4 border-[#2EC4C3]/15">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-[#2EC4C3]/15 flex items-center justify-center">
                <Sparkles size={13} className="text-[#2EC4C3]" />
              </div>
              <span className="text-white text-sm font-semibold">AI Market Analysis</span>
              <span className="ml-auto text-[10px] text-slate-500">Updated today</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "AI Fair Price", value: "€820–€890", color: "#2EC4C3" },
                { label: "Repair Estimate", value: "€0 — Good", color: "#10B981" },
                { label: "6mo Resale", value: "~€680", color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.06]">
                  <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                  <p className="text-xs font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Seller */}
          <Card className="p-4">
            <p className="text-slate-400 text-xs mb-3 font-medium">Seller</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center text-sm font-bold text-white">AK</div>
              <div>
                <p className="text-white text-sm font-semibold">Ahmed Kassem</p>
                <p className="text-slate-400 text-xs">Block A · 47 swaps · ⭐ 4.9 reputation</p>
              </div>
              <button className="ml-auto text-xs text-[#2EC4C3] border border-[#2EC4C3]/30 px-3 py-1.5 rounded-xl hover:bg-[#2EC4C3]/10 transition-colors font-medium">
                Message
              </button>
            </div>
          </Card>

          {/* CTAs */}
          <div className="flex gap-2.5">
            <button className="flex-1 bg-[#2EC4C3] text-[#0F172A] font-bold py-3 rounded-xl text-sm hover:bg-[#2EC4C3]/90 transition-all shadow-[0_0_20px_rgba(46,196,195,0.35)]">
              Buy Now · €850
            </button>
            <button className="flex-1 border border-[#3B82F6]/40 text-[#3B82F6] font-bold py-3 rounded-xl text-sm hover:bg-[#3B82F6]/10 transition-all">
              Propose Exchange
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── 6. AI REPAIR ASSISTANT ───────────────────────────────────────────────

const RepairPage = ({ nav }: { nav: (p: Page) => void }) => {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState(chatHistory);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [
      ...m,
      { role: "user", text: input },
      { role: "ai", text: "Analyzing your issue... Based on your description, I recommend checking the power supply first, then inspecting the connection pins. Here is a step-by-step diagnosis:\n\n1. Verify power input voltage\n2. Check for visible damage on pins\n3. Test with a multimeter at 5V\n\nEstimated repair time: 15–30 minutes · Estimated cost: €0–€5" },
    ]);
    setInput("");
  };

  const prompts = [
    "My laptop won't turn on",
    "Arduino not detected by USB",
    "Raspberry Pi SD won't boot",
    "Soldering iron tip worn out",
    "Battery draining in 2 hours",
  ];

  return (
    <AppLayout active="repair" nav={nav} title="AI Repair Assistant">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: "calc(100vh - 145px)" }}>
        {/* Left panel */}
        <div className="space-y-3 lg:col-span-1 overflow-y-auto">
          <Card className="p-3">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Quick Prompts</p>
            <div className="space-y-1.5">
              {prompts.map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="w-full text-left text-[11px] text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-xl px-3 py-2 transition-all border border-transparent hover:border-white/[0.08]">
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-3">
            <p className="text-xs text-slate-400 mb-2 font-semibold">Upload for Diagnosis</p>
            <button className="w-full border border-dashed border-white/[0.12] rounded-xl py-5 flex flex-col items-center gap-2 hover:border-[#2EC4C3]/40 hover:bg-[#2EC4C3]/5 transition-all">
              <Camera size={20} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Photo or PDF</span>
            </button>
          </Card>

          <Card className="p-3 border-[#F59E0B]/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={12} className="text-[#F59E0B]" />
              <p className="text-xs font-semibold text-[#F59E0B]">Safety Warning</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Always disconnect power before opening devices. High-voltage components require professional handling.</p>
          </Card>
        </div>

        {/* Chat window */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center shadow-[0_0_14px_rgba(46,196,195,0.4)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Swapy AI Repair</p>
              <p className="text-slate-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online · Powered by AI
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {m.role === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={11} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-[#2EC4C3] text-[#0F172A] font-semibold rounded-br-sm" : "bg-white/[0.06] text-slate-200 rounded-bl-sm"}`}>
                  <p className="text-xs leading-relaxed whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[#2EC4C3]/40 transition-colors">
              <button className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"><Upload size={14} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Describe the issue or upload a photo..." className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none" />
              <button className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"><Mic size={14} /></button>
              <button onClick={send} className="w-7 h-7 bg-[#2EC4C3] rounded-lg flex items-center justify-center hover:bg-[#2EC4C3]/80 transition-colors flex-shrink-0">
                <Send size={12} className="text-[#0F172A]" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

// ─── 7. SUSTAINABILITY DASHBOARD ──────────────────────────────────────────

const SustainabilityPage = ({ nav }: { nav: (p: Page) => void }) => {
  const metrics = [
    { label: "CO₂ Avoided", value: "112 kg", icon: Wind, color: "#2EC4C3", pct: 87 },
    { label: "Items Reused", value: "1,248", icon: Recycle, color: "#3B82F6", pct: 73 },
    { label: "Money Saved", value: "€2,450", icon: DollarSign, color: "#F59E0B", pct: 91 },
    { label: "Repairs Done", value: "89", icon: Wrench, color: "#10B981", pct: 66 },
    { label: "Donations", value: "234", icon: Heart, color: "#EC4899", pct: 78 },
    { label: "Waste Reduced", value: "48 kg", icon: Leaf, color: "#8B5CF6", pct: 82 },
  ];

  return (
    <AppLayout active="sustainability" nav={nav} title="Sustainability Dashboard">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Campus Impact Overview</h2>
        <p className="text-slate-400 text-xs mt-0.5">Academic Year 2024–2025 · Updated 4 July 2025</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {metrics.map(({ label, value, icon: Icon, color, pct }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div className="relative flex items-center justify-center">
                <ProgressRing pct={pct} color={color} size={38} />
                <span className="absolute text-[8px] font-bold" style={{ color }}>{pct}%</span>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white">{value}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{label}</p>
            <div className="mt-2.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="col-span-2 p-4">
          <p className="text-white text-sm font-semibold mb-0.5">CO₂ Savings Trend</p>
          <p className="text-slate-400 text-xs mb-4">Monthly kg avoided across campus</p>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={co2Data}>
              <defs>
                <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EC4C3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2EC4C3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#2EC4C3" fill="url(#sg1)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <p className="text-white text-sm font-semibold mb-0.5">Category Breakdown</p>
          <p className="text-slate-400 text-xs mb-2">Items reused by type</p>
          <ResponsiveContainer width="100%" height={145}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={TooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {pieData.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fill }} />
                  <span className="text-[10px] text-slate-300">{name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white text-sm font-semibold">Sustainability Leaderboard</p>
            <p className="text-slate-400 text-xs">Top eco-contributors this month</p>
          </div>
          <Trophy size={16} className="text-[#F59E0B]" />
        </div>
        <div className="space-y-2">
          {leaderboard.map(({ rank, name, pts, badge, av, color }) => (
            <div key={rank} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${rank === 1 ? "bg-[#F59E0B]/8 border border-[#F59E0B]/20" : "bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <span className="text-sm w-6 text-center flex-shrink-0">
                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : <span className="text-slate-500 text-xs font-bold">{rank}</span>}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                {av}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">{name}</p>
                <p className="text-slate-400 text-[10px]">{badge}</p>
              </div>
              <span className="text-[#2EC4C3] text-xs font-bold">{pts.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
};

// ─── 8. USER PROFILE ──────────────────────────────────────────────────────

const ProfilePage = ({ nav }: { nav: (p: Page) => void }) => {
  const badges = [
    { icon: Award, label: "Eco Contributor", sub: "Level 3", color: "#2EC4C3" },
    { icon: Wrench, label: "Repair Expert", sub: "Level 2", color: "#3B82F6" },
    { icon: Zap, label: "Tech Saver", sub: "Level 4", color: "#F59E0B" },
    { icon: Globe, label: "Circular Ambassador", sub: "Level 1", color: "#8B5CF6" },
  ];

  return (
    <AppLayout active="dashboard" nav={nav} title="My Profile">
      {/* Header card */}
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2EC4C3] to-[#3B82F6] flex items-center justify-center text-2xl font-extrabold text-white shadow-[0_0_20px_rgba(46,196,195,0.4)]">AK</div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#1E293B]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">Ahmed Kassem</h2>
            <p className="text-slate-400 text-sm mt-0.5">Computer Engineering · Year 3 · Block A</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Pill color="teal">Eco Pro</Pill>
              <Pill color="amber">Level 8</Pill>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-white text-xs font-semibold">4.87</span>
                <span className="text-slate-400 text-xs">(47 reviews)</span>
              </div>
            </div>
          </div>
          <button className="border border-white/[0.12] text-slate-300 px-4 py-2 rounded-xl text-xs hover:bg-white/[0.04] transition-colors flex-shrink-0">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
          {[
            { label: "Transactions", value: "47" },
            { label: "CO₂ Saved", value: "23 kg" },
            { label: "Money Saved", value: "€840" },
            { label: "Sustainability", value: "88%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-extrabold text-white">{value}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">XP Progress · Level 8 → 9</span>
            <span className="text-xs text-[#2EC4C3] font-bold">2,840 / 3,200 XP</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2EC4C3] to-[#3B82F6] rounded-full" style={{ width: "88.75%" }} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left col */}
        <div className="space-y-3">
          <Card className="p-4">
            <p className="text-white text-sm font-semibold mb-3">Badges & Achievements</p>
            <div className="grid grid-cols-2 gap-2">
              {badges.map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <p className="text-white text-[10px] font-semibold leading-tight">{label}</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-[#F59E0B]/15">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-[#F59E0B]" />
              <p className="text-white text-sm font-semibold">Daily Streak</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-4xl font-extrabold text-white">14</span>
                <span className="text-slate-400 text-sm ml-1">days</span>
              </div>
              <Flame size={32} className="text-[#F59E0B] opacity-80" />
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">7 more days to unlock the Eco Champion badge and 200 bonus XP.</p>
          </Card>
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-semibold">Active Listings</p>
              <button className="text-[#2EC4C3] text-xs hover:underline font-medium">View all 7 →</button>
            </div>
            <div className="space-y-2">
              {products.slice(0, 3).map(p => (
                <div key={p.id} onClick={() => nav("product")}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#111827] flex-shrink-0">
                    <img src={`https://images.unsplash.com/photo-${p.img}?w=80&h=80&fit=crop&auto=format`} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                    <p className="text-slate-400 text-[10px]">{p.category} · {p.condition}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#2EC4C3] text-sm font-bold">{p.price === 0 ? "Free" : `€${p.price}`}</p>
                    <Pill color={typeColor[p.type]}>{typeLabel[p.type]}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-white text-sm font-semibold mb-3">Recent Activity</p>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: 'Sold "Arduino Mega" to Karim B. for €25', time: "2 hours ago", color: "#10B981" },
                { icon: Award, text: "Earned badge: Repair Expert Level 2", time: "Yesterday", color: "#F59E0B" },
                { icon: Heart, text: 'Donated "Engineering Maths Vol.I" to library', time: "2 days ago", color: "#EC4899" },
                { icon: Star, text: "Received 5-star review from Sara M.", time: "3 days ago", color: "#2EC4C3" },
              ].map(({ icon: Icon, text, time, color }, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
                    <Icon size={11} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-slate-200 text-[11px] leading-snug">{text}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────

const AdminDashboardPage = ({ nav }: { nav: (p: Page) => void }) => (
  <AppLayout active="dashboard" nav={nav} title="Admin Dashboard">
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-[#2EC4C3]" />
        <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
      </div>
      <p className="text-slate-400 text-xs">Monitor users, marketplace activity, repair tickets, and sustainability impact.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {[
        { title: "Total Users", value: "4,203", change: "+38 this week", icon: Users, color: "#2EC4C3" },
        { title: "Published Listings", value: "1,248", change: "+74 this week", icon: Package, color: "#3B82F6" },
        { title: "Open Repairs", value: "32", change: "8 urgent", icon: Wrench, color: "#F59E0B" },
        { title: "Reports", value: "6", change: "Needs review", icon: AlertTriangle, color: "#EC4899" },
      ].map(({ title, value, change, icon: Icon, color }) => (
        <Card key={title} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs">{title}</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon size={14} style={{ color }} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{value}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{change}</p>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <p className="text-white text-sm font-semibold mb-3">Recent Admin Actions</p>
        <div className="space-y-3">
          {["Approved 14 new marketplace listings", "Resolved 3 user reports", "Assigned 5 repair tickets to campus mentors", "Updated sustainability leaderboard rules"].map((text) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
              <CheckCircle size={13} className="text-[#10B981]" />
              <span className="text-xs text-slate-200">{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-white text-sm font-semibold mb-3">Role Access</p>
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2EC4C3]/20 bg-[#2EC4C3]/10 p-3">
            <p className="text-xs font-semibold text-[#2EC4C3]">Admin</p>
            <p className="text-[11px] text-slate-300 mt-1">Can review users, moderate listings, and manage campus activity.</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-white">Student</p>
            <p className="text-[11px] text-slate-400 mt-1">Can browse, list, swap, repair, and track sustainability impact.</p>
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
);

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const nav = (p: Page) => setPage(p);
  const isProtectedPage = page !== "landing" && page !== "login";

  const handleAuthSuccess = (nextSession: AuthSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setPage("dashboard");
  };

  if (page === "landing") return <LandingPage nav={nav} />;
  if (page === "login") return <LoginPage nav={nav} onAuthSuccess={handleAuthSuccess} />;
  if (isProtectedPage && !session) return <LoginPage nav={nav} onAuthSuccess={handleAuthSuccess} />;
  if (page === "dashboard" && session?.user.role === "ADMIN") return <AdminDashboardPage nav={nav} />;
  if (page === "dashboard") return <DashboardPage nav={nav} />;
  if (page === "marketplace") return <MarketplacePage nav={nav} />;
  if (page === "product") return <ProductPage nav={nav} />;
  if (page === "repair") return <RepairPage nav={nav} />;
  if (page === "sustainability") return <SustainabilityPage nav={nav} />;
  return <ProfilePage nav={nav} />;
}
