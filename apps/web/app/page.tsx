"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress, getStreak } from "@cognitive/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProgressData {
  completedCount: number;
  totalXp: number;
  streak: number;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-black text-lg text-purple-700 tracking-tight">CogniLearn</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Home", href: "/", icon: "🏠" },
            { label: "World Map", href: "/world/1", icon: "🗺️" },
            { label: "Progress", href: "/settings", icon: "📊" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-700 text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Settings"
        >
          ⚙️
        </Link>
      </div>
    </nav>
  );
}

// ─── Gamification Bar ─────────────────────────────────────────────────────────
function GamificationBar({ xp, completed, streak }: { xp: number; completed: number; streak: number }) {
  const level = Math.floor(xp / 100) + 1;
  const levelXp = xp % 100;
  const titles = ["Beginner", "Explorer", "Adventurer", "Champion", "Legend"];
  const title = titles[Math.min(level - 1, titles.length - 1)];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 flex flex-wrap items-center gap-4 md:gap-8">
      {/* Level */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          {level}
        </div>
        <div>
          <div className="text-xs text-slate-400 leading-none">Level</div>
          <div className="font-800 text-slate-700 text-sm">{title}</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="flex-1 min-w-32">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>XP</span>
          <span>{levelXp} / 100</span>
        </div>
        <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${levelXp}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
        <span className="text-lg">🔥</span>
        <div>
          <div className="font-800 text-orange-600 text-sm leading-none">{streak} gün</div>
          <div className="text-xs text-orange-400">seri</div>
        </div>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl">
        <span className="text-lg">🪙</span>
        <div>
          <div className="font-800 text-yellow-600 text-sm leading-none">{completed * 15}</div>
          <div className="text-xs text-yellow-500">coins</div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-8 md:p-12 text-white">
      {/* Background dots */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Floating emoji decorations */}
      <div className="absolute top-6 right-8 text-4xl animate-float select-none">🌍</div>
      <div className="absolute top-16 right-28 text-2xl animate-float-delay select-none">⭐</div>
      <div className="absolute bottom-10 right-16 text-3xl animate-float-slow select-none">🚀</div>
      <div className="absolute bottom-6 right-36 text-2xl animate-float select-none">💡</div>

      <div className="relative max-w-lg">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-700 mb-4">
          <span>✨</span> Learning made fun for ages 6–12
        </div>
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
          Cognitive<br />
          <span className="text-yellow-300">Learning</span> Platform
        </h1>
        <p className="text-white/80 text-base md:text-lg mb-8 max-w-sm">
          Explore worlds, solve puzzles, and grow your brain — one adventure at a time!
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/world/1"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-800 px-6 py-3 rounded-2xl text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            🗺️ Explore World Map
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm font-700 px-6 py-3 rounded-2xl text-base border border-white/30 hover:scale-105 transition-all duration-200"
          >
            📈 Continue Progress
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── World Cards ──────────────────────────────────────────────────────────────
function WorldCards() {
  const worlds = [
    {
      id: "1",
      name: "First Steps",
      description: "Learn to move one step at a time",
      icon: "🟢",
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      status: "active" as const,
      levels: 4,
    },
    {
      id: "2",
      name: "Algorithm Builder",
      description: "Plan your moves, then run the program!",
      icon: "🧩",
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      status: "active" as const,
      levels: 21,
    },
    {
      id: "3",
      name: "Chess Kingdom",
      description: "Learn chess from zero — piece by piece!",
      icon: "♟️",
      color: "from-pink-500 to-purple-600",
      bg: "bg-pink-50",
      border: "border-pink-200",
      status: "active" as const,
      levels: 12,
    },
    {
      id: "4",
      name: "Loop Land",
      description: "Discover patterns and repeat them with loops!",
      icon: "🔁",
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      status: "active" as const,
      levels: 12,
    },
    {
      id: "5",
      name: "Akıllı Yollar",
      description: "Koşulları öğren — robota karar verdirmeyi öğret!",
      icon: "🤔",
      color: "from-sky-400 to-cyan-500",
      bg: "bg-sky-50",
      border: "border-sky-200",
      status: "active" as const,
      levels: 10,
    },
    {
      id: "6",
      name: "Fonksiyon Fabrikası",
      description: "Kendi komutlarını yarat ve tekrar kullan!",
      icon: "🔧",
      color: "from-violet-500 to-fuchsia-500",
      bg: "bg-violet-50",
      border: "border-violet-200",
      status: "active" as const,
      levels: 10,
    },
    {
      id: "7",
      name: "Hata Avcısı",
      description: "Bozuk kodu bul ve düzelt — gerçek programcılar böyle çalışır!",
      icon: "🐛",
      color: "from-rose-500 to-red-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      status: "active" as const,
      levels: 8,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-black text-slate-700 mb-4">🗺️ Worlds</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {worlds.map((world) => (
          <div key={world.id} className="relative group">
            {world.status === "locked" ? (
              <div className={`${world.bg} ${world.border} border-2 rounded-2xl p-5 opacity-60 cursor-not-allowed`}>
                <div className="text-3xl mb-3">🔒</div>
                <div className="font-800 text-slate-500 text-base">{world.name}</div>
                <div className="text-sm text-slate-400 mt-1">{world.description}</div>
                <div className="mt-3 text-xs text-slate-400">{world.levels} levels</div>
              </div>
            ) : (
              <Link href={`/world/${world.id}`} className="block">
                <div className={`${world.bg} ${world.border} border-2 rounded-2xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${world.color} flex items-center justify-center text-2xl mb-3 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    {world.icon}
                  </div>
                  <div className="font-800 text-slate-700 text-base">{world.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{world.description}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{world.levels} levels</span>
                    <span className="text-xs font-700 text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      🌟 Active
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Dashboard ───────────────────────────────────────────────────────
function ProgressDashboard({ completed, xp }: { completed: number; xp: number }) {
  const skills = [
    { name: "Logic", value: Math.min(100, completed * 20 + 15), color: "bg-purple-500", icon: "🧩" },
    { name: "Memory", value: Math.min(100, completed * 15 + 10), color: "bg-blue-500", icon: "🧠" },
    { name: "Attention", value: Math.min(100, completed * 18 + 8), color: "bg-pink-500", icon: "👁️" },
  ];

  return (
    <div>
      <h2 className="text-xl font-black text-slate-700 mb-4">📊 Your Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Lessons */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-3xl font-black text-blue-600">{completed}</div>
          <div className="text-sm text-slate-500 font-600">Completed Levels</div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-sm font-700 text-slate-600 mb-2">Daily Goal</div>
          <div className="h-3 bg-green-100 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, completed * 33)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400">{Math.min(3, completed)} / 3 levels today</div>
        </div>

        {/* Total XP */}
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-3xl font-black text-purple-600">{xp}</div>
          <div className="text-sm text-slate-500 font-600">Total XP</div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="font-800 text-slate-600 mb-4 text-sm">Skill Progress</div>
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.name} className="flex items-center gap-3">
              <span className="text-xl w-7">{skill.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-700">{skill.name}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────
function Achievements({ completed, streak }: { completed: number; streak: number }) {
  const badges = [
    {
      id: "first",
      icon: "🗺️",
      name: "İlk Kaşif",
      desc: "İlk level'ı tamamla",
      color: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-50 border-yellow-200",
      unlocked: completed >= 1,
    },
    {
      id: "streak3",
      icon: "🔥",
      name: "3 Günlük Seri",
      desc: "3 gün üst üste oyna",
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-50 border-orange-200",
      unlocked: streak >= 3,
    },
    {
      id: "fast",
      icon: "⚡",
      name: "Hızlı Öğrenci",
      desc: "10 level tamamla",
      color: "from-blue-400 to-indigo-500",
      bg: "bg-blue-50 border-blue-200",
      unlocked: completed >= 10,
    },
    {
      id: "algo",
      icon: "🧩",
      name: "Algoritma Ustası",
      desc: "21 sequence level bitir",
      color: "from-violet-400 to-purple-500",
      bg: "bg-violet-50 border-violet-200",
      unlocked: completed >= 21,
    },
    {
      id: "loop",
      icon: "🔁",
      name: "Döngü Ustası",
      desc: "Loop Land'i bitir (12 level)",
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50 border-amber-200",
      unlocked: completed >= 33,
    },
    {
      id: "cond",
      icon: "🤔",
      name: "Karar Verici",
      desc: "Akıllı Yollar'ı bitir",
      color: "from-sky-400 to-cyan-500",
      bg: "bg-sky-50 border-sky-200",
      unlocked: completed >= 43,
    },
    {
      id: "func",
      icon: "🔧",
      name: "Fonksiyon Ustası",
      desc: "Fonksiyon Fabrikası'nı bitir",
      color: "from-violet-500 to-fuchsia-500",
      bg: "bg-purple-50 border-purple-200",
      unlocked: completed >= 53,
    },
    {
      id: "debug",
      icon: "🐛",
      name: "Hata Avcısı",
      desc: "Tüm debug levelları tamamla",
      color: "from-rose-500 to-red-600",
      bg: "bg-rose-50 border-rose-200",
      unlocked: completed >= 61,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-black text-slate-700 mb-4">🏅 Achievements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`border-2 rounded-2xl p-4 text-center transition-all duration-200 ${
              badge.unlocked
                ? `${badge.bg} hover:scale-105 hover:shadow-md`
                : "bg-slate-50 border-slate-200 opacity-50"
            }`}
          >
            <div
              className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl mb-2 shadow-sm ${
                badge.unlocked ? "" : "grayscale"
              }`}
            >
              {badge.icon}
            </div>
            <div className="font-800 text-slate-700 text-xs leading-tight">{badge.name}</div>
            <div className="text-xs text-slate-400 mt-1">{badge.desc}</div>
            {badge.unlocked && (
              <div className="mt-2 text-xs font-700 text-emerald-600">✅ Unlocked</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-4 animate-float inline-block">🌱</div>
      <h3 className="text-xl font-black text-slate-600 mb-2">Your adventure begins here!</h3>
      <p className="text-slate-400 mb-6 max-w-xs mx-auto">
        You haven't completed any levels yet. Jump in and start exploring!
      </p>
      <Link
        href="/world/1"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-800 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        🚀 Start Learning
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [progress, setProgress] = useState<ProgressData>({ completedCount: 0, totalXp: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadProgress();
    const completedCount = Object.keys(data.completedLevels).length;
    const totalXp = Object.values(data.completedLevels).reduce(
      (sum, stars) => sum + stars * 30,
      0
    );
    const streak = getStreak();
    setProgress({ completedCount, totalXp, streak });
    setLoaded(true);
  }, []);

  const isEmpty = progress.completedCount === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <Navbar />

      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-200 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
        {/* Gamification Bar */}
        {loaded && (
          <GamificationBar xp={progress.totalXp} completed={progress.completedCount} streak={progress.streak} />
        )}

        {/* Hero */}
        <HeroSection />

        {/* Empty state or content */}
        {!loaded ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded-full w-40 mb-4" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-28 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <EmptyState />
          </div>
        ) : (
          <ProgressDashboard completed={progress.completedCount} xp={progress.totalXp} />
        )}

        {/* Worlds */}
        <WorldCards />

        {/* Achievements */}
        {loaded && <Achievements completed={progress.completedCount} streak={progress.streak} />}
      </main>
    </div>
  );
}
