"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Download,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useProgressStore } from "@/store/progressStore";
import { Button, ProgressBar, StatusPill } from "@/components/ui";
import paths from "@/data/paths.json";

export default function DashboardPage() {
  const router = useRouter();
  const { progress, exportProgress } = useProgressStore();

  // Overall stats
  const totalNodes = paths.reduce((a, p) => a + p.nodes.length, 0);
  const totalDone = paths.reduce((a, p) => {
    const pp = progress[p.path_id] || {};
    return a + Object.values(pp).filter((s) => s === "done").length;
  }, 0);
  const totalLearning = paths.reduce((a, p) => {
    const pp = progress[p.path_id] || {};
    return a + Object.values(pp).filter((s) => s === "learning").length;
  }, 0);
  const totalRemaining = totalNodes - totalDone - totalLearning;
  const overallPercent = totalNodes > 0 ? Math.round((totalDone / totalNodes) * 100) : 0;

  // Per-path data for chart
  const chartData = paths.map((p) => {
    const pp = progress[p.path_id] || {};
    const done = Object.values(pp).filter((s) => s === "done").length;
    const learning = Object.values(pp).filter((s) => s === "learning").length;
    return {
      name: p.title.length > 16 ? p.title.slice(0, 14) + "…" : p.title,
      fullName: p.title,
      pathId: p.path_id,
      done,
      learning,
      total: p.nodes.length,
      color: p.color,
      percent: p.nodes.length > 0 ? Math.round((done / p.nodes.length) * 100) : 0,
    };
  }).filter((d) => d.done > 0 || d.learning > 0);

  // Recommended next steps
  const nextSteps = useMemo(() => {
    const steps: Array<{ nodeTitle: string; pathTitle: string; pathId: string; requires: string[] }> = [];
    paths.forEach((p) => {
      const pp = progress[p.path_id] || {};
      p.nodes.forEach((n) => {
        const status = pp[n.id] ?? "not_started";
        if (status === "not_started") {
          const allPrereqsDone = n.connections.every((c) => {
            // Check if this node has any incoming connections (i.e. it's a dependency target)
            // For simplicity, recommend nodes where at least one parent is done
            return true;
          });
          // Find nodes that are direct dependencies that are done or learning
          const isReachable = p.nodes.some(
            (other) => other.connections.includes(n.id) && (pp[other.id] === "done" || pp[other.id] === "learning")
          );
          // Or if it's a root node (no parent) and progress has started in this path
          const isRoot = !p.nodes.some((other) => other.connections.includes(n.id));
          const pathHasProgress = Object.keys(pp).length > 0;

          if (isReachable || (isRoot && pathHasProgress)) {
            steps.push({
              nodeTitle: n.title,
              pathTitle: p.title,
              pathId: p.path_id,
              requires: n.connections,
            });
          }
        }
      });
    });
    return steps.slice(0, 5);
  }, [progress]);

  // Handle export
  const handleExport = () => {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devpath-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Ringkasan progres belajarmu</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export Progress
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp,
            value: `${overallPercent}%`,
            label: "Overall Progress",
            color: "text-primary",
            bg: "bg-primary-50",
            iconColor: "text-primary",
          },
          {
            icon: CheckCircle2,
            value: totalDone,
            label: "Skills Completed",
            color: "text-success",
            bg: "bg-success-light",
            iconColor: "text-success",
          },
          {
            icon: Clock,
            value: totalLearning,
            label: "In Progress",
            color: "text-primary",
            bg: "bg-primary-50",
            iconColor: "text-primary",
          },
          {
            icon: BookOpen,
            value: totalRemaining,
            label: "Remaining",
            color: "text-text-secondary",
            bg: "bg-surface-tertiary",
            iconColor: "text-text-muted",
          },
        ].map(({ icon: Icon, value, label, color, bg, iconColor }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text-primary">Progress per Path</h2>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, "dataMax"]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-border rounded-xl p-3 shadow-card-hover text-sm">
                        <p className="font-bold text-text-primary mb-1">{d.fullName}</p>
                        <p className="text-success">✓ Done: {d.done}</p>
                        <p className="text-primary">◷ Learning: {d.learning}</p>
                        <p className="text-text-muted">Total: {d.total}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="done" name="Done" stackId="a" radius={[0, 0, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill="#10B981" />
                  ))}
                </Bar>
                <Bar dataKey="learning" name="Learning" stackId="a" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <BarChart2 className="w-10 h-10 text-text-muted mb-3" />
              <p className="text-text-secondary font-semibold">Belum ada progress</p>
              <p className="text-sm text-text-muted mt-1">Mulai belajar dari Path Catalog</p>
              <Button variant="secondary" className="mt-4" onClick={() => router.push("/paths")}>
                Explore Paths
              </Button>
            </div>
          )}
        </div>

        {/* Per-path Summary */}
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-text-primary mb-4">Path Summary</h2>
          <div className="space-y-4 scrollbar-thin overflow-y-auto max-h-[280px]">
            {paths.map((p) => {
              const pp = progress[p.path_id] || {};
              const done = Object.values(pp).filter((s) => s === "done").length;
              const pct = p.nodes.length > 0 ? Math.round((done / p.nodes.length) * 100) : 0;
              if (done === 0) return null;
              return (
                <div
                  key={p.path_id}
                  className="cursor-pointer group"
                  onClick={() => router.push(`/roadmap/${p.path_id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {p.title}
                    </span>
                    <span className="text-xs font-bold ml-2 shrink-0" style={{ color: p.color }}>{pct}%</span>
                  </div>
                  <ProgressBar percent={pct} color={p.color} height={4} />
                </div>
              );
            })}
            {Object.keys(progress).length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">Belum ada path yang dimulai.</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">Recommended Next Steps</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextSteps.map((step, i) => (
              <div
                key={`${step.pathId}-${i}`}
                className="card-interactive group"
                onClick={() => router.push(`/roadmap/${step.pathId}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                      {step.nodeTitle}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{step.pathTitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
