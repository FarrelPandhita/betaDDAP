"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Video,
  Book,
  Code2,
  ChevronRight,
  X,
  Circle,
} from "lucide-react";
import { useProgressStore, type NodeStatus } from "@/store/progressStore";
import { Button, StatusPill, Badge } from "@/components/ui";
import paths from "@/data/paths.json";

// Dynamic import to avoid SSR issues with @xyflow/react
const FlowCanvas = dynamic(() => import("@/components/roadmap/FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading roadmap...</p>
      </div>
    </div>
  ),
});

type PathNode = (typeof paths)[0]["nodes"][0];
type PathData = (typeof paths)[0];

// ===== RESOURCE ICON =====
function ResourceIcon({ type }: { type: string }) {
  const icons: Record<string, React.ElementType> = {
    course: Video,
    docs: FileText,
    article: FileText,
    video: Video,
    book: Book,
    practice: Code2,
    interactive: Code2,
    research: FileText,
  };
  const Icon = icons[type] || LinkIcon;
  return <Icon className="w-4 h-4 text-slate-400 shrink-0" />;
}

// ===== NODE DETAIL DRAWER =====
function NodeDetailDrawer({
  node,
  pathId,
  onClose,
}: {
  node: PathNode | null;
  pathId: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "checklist" | "resources">("overview");
  const { progress, setNodeStatus } = useProgressStore();

  const status: NodeStatus = node ? (progress[pathId]?.[node.id] ?? "not_started") : "not_started";

  // Reset tab when node changes
  useEffect(() => setActiveTab("overview"), [node?.id]);

  if (!node) return null;

  const levelColorMap: Record<string, "green" | "blue" | "orange"> = {
    beginner: "green",
    intermediate: "blue",
    advanced: "orange",
  };

  return (
    <aside
      className="w-[360px] shrink-0 flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden"
      style={{ animation: "slideIn 0.25s ease-out" }}
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="font-bold text-lg text-slate-900 leading-tight">{node.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <StatusPill status={status} size="sm" />
          <Badge color={levelColorMap[node.level] ?? "default"}>
            {node.level}
          </Badge>
          {(node as PathNode & { semester?: number }).semester && (
            <Badge color="default">Semester {(node as PathNode & { semester?: number }).semester}</Badge>
          )}
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={status === "learning" ? "primary" : "secondary"}
            onClick={() =>
              setNodeStatus(pathId, node.id, status === "learning" ? "not_started" : "learning")
            }
            fullWidth
          >
            <Clock className="w-3.5 h-3.5" />
            {status === "learning" ? "Unmark" : "Mark Learning"}
          </Button>
          <Button
            size="sm"
            variant={status === "done" ? "primary" : "secondary"}
            onClick={() =>
              setNodeStatus(pathId, node.id, status === "done" ? "not_started" : "done")
            }
            fullWidth
            className={status === "done" ? "!bg-emerald-500 !text-white" : ""}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status === "done" ? "Completed ✓" : "Mark Done"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {(["overview", "checklist", "resources"] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: "thin" }}>
        {activeTab === "overview" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{node.description}</p>

            {node.tags && node.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {node.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {node.connections && node.connections.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Leads To</p>
                <div className="flex flex-col gap-1">
                  {node.connections.map((conn) => {
                    const targetPath = paths.find((p) => p.nodes.some((n) => n.id === conn));
                    const targetNode = targetPath?.nodes.find((n) => n.id === conn);
                    return (
                      <div key={conn} className="flex items-center gap-2 text-sm text-slate-500">
                        <ChevronRight className="w-3.5 h-3.5 text-primary-500" />
                        <span>{targetNode?.title ?? conn}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Learning Objectives
            </p>
            {node.checklist?.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
            {(!node.checklist || node.checklist.length === 0) && (
              <p className="text-sm text-slate-400">Belum ada checklist tersedia.</p>
            )}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Curated Resources
            </p>
            {node.resources?.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <ResourceIcon type={res.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate">
                    {res.title}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">{res.type}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
              </a>
            ))}
            {(!node.resources || node.resources.length === 0) && (
              <p className="text-sm text-slate-400">Belum ada resource tersedia.</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

// ===== MAIN PAGE =====
export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.pathId as string;

  const { progress, setActivePathId } = useProgressStore();

  const pathData: PathData | undefined = paths.find((p) => p.path_id === pathId);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<NodeStatus | "all">("all");

  useEffect(() => {
    if (pathId) setActivePathId(pathId);
  }, [pathId, setActivePathId]);

  if (!pathData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-slate-500 font-semibold mb-2">Path tidak ditemukan</p>
          <Button onClick={() => router.push("/paths")}>Kembali ke Paths</Button>
        </div>
      </div>
    );
  }

  const selectedNode = selectedNodeId ? pathData.nodes.find((n) => n.id === selectedNodeId) ?? null : null;
  const pathProgress = progress[pathId] || {};
  const done = Object.values(pathProgress).filter((s) => s === "done").length;
  const learning = Object.values(pathProgress).filter((s) => s === "learning").length;
  const percent = pathData.nodes.length > 0 ? Math.round((done / pathData.nodes.length) * 100) : 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <button
          onClick={() => router.push("/paths")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <div>
          <h1 className="font-bold text-sm text-slate-900">{pathData.title}</h1>
          <p className="text-xs text-slate-400">{done}/{pathData.nodes.length} nodes · {percent}% complete</p>
        </div>

        <div className="flex-1" />

        {/* Filter */}
        <div className="flex items-center gap-1">
          {(["all", "not_started", "learning", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === f
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              {f === "all" ? "All" : f === "not_started" ? "Not Started" : f === "learning" ? "Learning" : "Done"}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{done} done
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />{learning} learning
          </span>
        </div>
      </div>

      {/* Canvas + Drawer */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <FlowCanvas
            pathData={pathData}
            pathProgress={pathProgress}
            filterStatus={filterStatus}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNodeId}
            onPaneClick={() => setSelectedNodeId(null)}
          />
        </div>

        {selectedNode && (
          <NodeDetailDrawer
            node={selectedNode}
            pathId={pathId}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
