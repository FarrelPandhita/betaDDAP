"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  BookOpen,
  Server,
  Monitor,
  Brain,
  Shield,
  GitBranch,
  GraduationCap,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Filter,
} from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { Button, ProgressBar, Badge } from "@/components/ui";
import paths from "@/data/paths.json";

const iconMap: Record<string, React.ElementType> = {
  Server,
  Monitor,
  Brain,
  Shield,
  GitBranch,
  GraduationCap,
  Database,
  BookOpen,
};

function PathCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress, setActivePathId } = useProgressStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "competency" | "study_program">(
    (searchParams.get("category") as "competency" | "study_program") || "all"
  );

  const filtered = paths.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Learning Paths</h1>
        <p className="text-text-secondary">
          Pilih jalur belajar yang sesuai dengan tujuan karirmu atau kurikulum program studimu.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari path atau teknologi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          {(["all", "competency", "study_program"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-text-secondary border border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat === "all" ? "All" : cat === "competency" ? "Competency" : "Study Program"}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-4">
        Menampilkan <span className="font-semibold text-text-primary">{filtered.length}</span> learning path
      </p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((path) => {
          const Icon = iconMap[path.icon] || BookOpen;
          const pp = progress[path.path_id] || {};
          const done = Object.values(pp).filter((s) => s === "done").length;
          const learning = Object.values(pp).filter((s) => s === "learning").length;
          const percent = path.nodes.length > 0 ? Math.round((done / path.nodes.length) * 100) : 0;
          const hasProgress = done > 0 || learning > 0;

          return (
            <div
              key={path.path_id}
              className="card group flex flex-col cursor-pointer"
              onClick={() => {
                setActivePathId(path.path_id);
                router.push(`/roadmap/${path.path_id}`);
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${path.color}18` }}
                >
                  <Icon className="w-6 h-6" style={{ color: path.color }} />
                </div>
                <Badge color={path.category === "competency" ? "blue" : "purple"}>
                  {path.category === "competency" ? "Competency" : "Study Program"}
                </Badge>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-lg text-text-primary mb-1 group-hover:text-primary transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4 flex-1 line-clamp-2">{path.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {path.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-surface-tertiary rounded-full text-text-secondary border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {path.nodes.length} skills
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{path.estimatedWeeks} weeks
                </span>
              </div>

              {/* Progress (if started) */}
              {hasProgress ? (
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text-muted">{done} done · {learning} in progress</span>
                    <span className="text-xs font-bold" style={{ color: path.color }}>{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} color={path.color} height={5} />
                </div>
              ) : (
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>0 / {path.nodes.length} completed</span>
                    <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                      Start Path <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-semibold">Tidak ada path yang cocok</p>
          <p className="text-sm text-text-muted mt-1">Coba kata kunci yang berbeda</p>
        </div>
      )}
    </div>
  );
}

export default function PathsPage() {
  return (
    <Suspense>
      <PathCatalogContent />
    </Suspense>
  );
}
