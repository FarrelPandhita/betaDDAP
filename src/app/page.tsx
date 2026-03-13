"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Server,
  Monitor,
  Brain,
  Shield,
  GitBranch,
  GraduationCap,
  Database,
} from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { Button, ProgressBar, StatusPill } from "@/components/ui";
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

const categoryColorMap: Record<string, string> = {
  backend_dev: "#2563EB",
  frontend_dev: "#7C3AED",
  ai_engineer: "#059669",
  cybersecurity: "#DC2626",
  devops: "#D97706",
  teknik_informatika: "#2563EB",
  sistem_informasi: "#7C3AED",
};

export default function HomePage() {
  const router = useRouter();
  const { progress, activePathId, setActivePathId } = useProgressStore();

  // Find active path
  const activePath = activePathId
    ? paths.find((p) => p.path_id === activePathId)
    : null;

  // Compute stats for active path
  const activePathNodeCount = activePath?.nodes.length ?? 0;
  const activePathProgress = activePath ? (progress[activePath.path_id] || {}) : {};
  const activeDone = Object.values(activePathProgress).filter((s) => s === "done").length;
  const activeLearning = Object.values(activePathProgress).filter((s) => s === "learning").length;
  const activePercent = activePathNodeCount > 0 ? Math.round((activeDone / activePathNodeCount) * 100) : 0;

  // Find next recommended node (first "not_started" from active path)
  const nextNode = activePath?.nodes.find(
    (n) => !activePathProgress[n.id] || activePathProgress[n.id] === "not_started"
  );

  // Recent activity across all paths
  const recentActivity: Array<{ nodeTitle: string; pathTitle: string; pathId: string; nodeId: string; status: string }> = [];
  paths.forEach((p) => {
    const pp = progress[p.path_id] || {};
    Object.entries(pp).forEach(([nodeId, status]) => {
      const node = p.nodes.find((n) => n.id === nodeId);
      if (node && status !== "not_started") {
        recentActivity.push({
          nodeTitle: node.title,
          pathTitle: p.title,
          pathId: p.path_id,
          nodeId,
          status,
        });
      }
    });
  });

  // Total progress
  const totalNodes = paths.reduce((acc, p) => acc + p.nodes.length, 0);
  const totalDone = paths.reduce((acc, p) => {
    const pp = progress[p.path_id] || {};
    return acc + Object.values(pp).filter((s) => s === "done").length;
  }, 0);
  const totalLearning = paths.reduce((acc, p) => {
    const pp = progress[p.path_id] || {};
    return acc + Object.values(pp).filter((s) => s === "learning").length;
  }, 0);

  const competencyPaths = paths.filter((p) => p.category === "competency");
  const studyPaths = paths.filter((p) => p.category === "study_program");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ===== HERO / CONTINUE LEARNING ===== */}
      {activePath ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-secondary p-8 text-white">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Continue Learning</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{activePath.title}</h1>
            <p className="text-blue-200 mb-6 max-w-xl">{activePath.description}</p>

            {/* Progress stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div>
                <p className="text-3xl font-bold">{activePercent}%</p>
                <p className="text-xs text-blue-300">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{activeDone}</p>
                <p className="text-xs text-blue-300">Skills Mastered</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{activeLearning}</p>
                <p className="text-xs text-blue-300">In Progress</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6 max-w-md">
              <ProgressBar percent={activePercent} color="#38BDF8" height={8} />
            </div>

            {/* Next up */}
            {nextNode && (
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 mb-6 max-w-sm backdrop-blur-sm border border-white/20">
                <Zap className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-blue-300">Next up</p>
                  <p className="text-sm font-semibold">{nextNode.title}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/roadmap/${activePath.path_id}`)}
                className="!bg-white !text-primary hover:!bg-blue-50"
              >
                Continue Roadmap <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/paths")}
                className="!text-white hover:!bg-white/10"
              >
                Browse All Paths
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* No active path — welcome hero */
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-secondary p-8 sm:p-12 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Selamat Datang di DevPath</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance leading-tight">
              Your Learning<br />
              <span className="text-accent">Roadmap</span> Starts Here
            </h1>

            <p className="text-blue-200 text-lg mb-8 max-w-xl">
              Platform roadmap belajar interaktif untuk mahasiswa FILKOM UB. Temukan jalur skill IT yang tepat untuk karirmu — dari kurikulum prodi hingga karir industri.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/paths")}
                className="!bg-white !text-primary hover:!bg-blue-50"
                size="lg"
              >
                Mulai Eksplorasi <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Features row */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { icon: BookOpen, text: "10+ Learning Paths" },
                { icon: TrendingUp, text: "Progress Tracker" },
                { icon: Star, text: "Curated Resources" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-blue-200">
                  <Icon className="w-4 h-4 text-accent" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== GLOBAL STATS (only if has progress) ===== */}
      {(totalDone > 0 || totalLearning > 0) && (
        <section className="grid grid-cols-3 gap-4">
          {[
            { value: totalDone, label: "Skills Completed", icon: CheckCircle2, color: "text-success" },
            { value: totalLearning, label: "In Progress", icon: Clock, color: "text-primary" },
            { value: totalNodes - totalDone - totalLearning, label: "Remaining", icon: BookOpen, color: "text-text-muted" },
          ].map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="card text-center">
              <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </section>
      )}

      {/* ===== PATH PICKER — COMPETENCY ===== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Competency Paths</h2>
            <p className="text-sm text-text-secondary mt-0.5">Jalur karir industri untuk developer profesional</p>
          </div>
          <Link href="/paths?category=competency" className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competencyPaths.map((path) => {
            const Icon = iconMap[path.icon] || BookOpen;
            const pp = progress[path.path_id] || {};
            const done = Object.values(pp).filter((s) => s === "done").length;
            const percent = path.nodes.length > 0 ? Math.round((done / path.nodes.length) * 100) : 0;
            const isActive = activePathId === path.path_id;

            return (
              <div
                key={path.path_id}
                onClick={() => {
                  setActivePathId(path.path_id);
                  router.push(`/roadmap/${path.path_id}`);
                }}
                className={`card-interactive group ${isActive ? "ring-2 ring-primary shadow-card-active" : ""}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${path.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: path.color }} />
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {path.title}
                </h3>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{path.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {path.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-surface-tertiary rounded-full text-text-secondary border border-border">
                      {tag}
                    </span>
                  ))}
                </div>

                <ProgressBar percent={percent} color={path.color} height={4} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-text-muted">{done}/{path.nodes.length} skills</span>
                  <span className="text-xs font-semibold" style={{ color: path.color }}>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== PATH PICKER — STUDY PROGRAM ===== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Study Program Paths</h2>
            <p className="text-sm text-text-secondary mt-0.5">Kurikulum resmi program studi FILKOM UB</p>
          </div>
          <Link href="/paths?category=study_program" className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {studyPaths.map((path) => {
            const Icon = iconMap[path.icon] || GraduationCap;
            const pp = progress[path.path_id] || {};
            const done = Object.values(pp).filter((s) => s === "done").length;
            const percent = path.nodes.length > 0 ? Math.round((done / path.nodes.length) * 100) : 0;
            const isActive = activePathId === path.path_id;

            return (
              <div
                key={path.path_id}
                onClick={() => {
                  setActivePathId(path.path_id);
                  router.push(`/roadmap/${path.path_id}`);
                }}
                className={`card-interactive group flex gap-4 ${isActive ? "ring-2 ring-primary shadow-card-active" : ""}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${path.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: path.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                      {path.title}
                    </h3>
                    {isActive && (
                      <span className="text-xs font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mb-2 line-clamp-1">{path.description}</p>
                  <ProgressBar percent={percent} color={path.color} height={3} />
                  <p className="text-xs text-text-muted mt-1">{done}/{path.nodes.length} completed</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== RECENT ACTIVITY ===== */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
          <div className="card !p-0 overflow-hidden divide-y divide-border">
            {recentActivity.slice(0, 5).map((item, i) => (
              <div
                key={`${item.pathId}-${item.nodeId}-${i}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-secondary transition-colors cursor-pointer"
                onClick={() => router.push(`/roadmap/${item.pathId}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">{item.nodeTitle}</p>
                  <p className="text-xs text-text-muted truncate">{item.pathTitle}</p>
                </div>
                <StatusPill status={item.status as "not_started" | "learning" | "done"} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
