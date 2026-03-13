"use client";

import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import type { NodeStatus } from "@/store/progressStore";
import paths from "@/data/paths.json";

type PathData = (typeof paths)[0];
type PathProgress = Record<string, NodeStatus>;

interface FlowCanvasProps {
  pathData: PathData;
  pathProgress: PathProgress;
  filterStatus: NodeStatus | "all";
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
  onPaneClick: () => void;
}

// Custom node component
function RoadmapNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const label = data.label as string;
  const status = (data.status as NodeStatus) ?? "not_started";
  const tags = data.tags as string[];
  const onClick = data.onClick as () => void;

  const statusStyles: Record<NodeStatus, string> = {
    not_started: "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:shadow-lg",
    learning: "bg-blue-50 border-blue-400 text-blue-700 shadow-md",
    done: "bg-emerald-50 border-emerald-400 text-emerald-700",
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: "solid",
        padding: "10px 14px",
        minWidth: 160,
        maxWidth: 200,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        ...(selected ? { outline: "2px solid #2563EB", outlineOffset: 2, transform: "scale(1.05)" } : {}),
      }}
      className={statusStyles[status]}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, borderColor: "#CBD5E1", background: "white" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {status === "done" ? (
          <CheckCircle2 size={18} color="#10B981" />
        ) : status === "learning" ? (
          <Clock size={18} color="#2563EB" style={{ animation: "pulse 2s infinite" }} />
        ) : (
          <Circle size={18} color="#CBD5E1" />
        )}
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
        {tags?.[0] && (
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.6)", borderRadius: 999, border: "1px solid rgba(255,255,255,0.8)", color: "#64748B" }}>
            {tags[0]}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, borderColor: "#CBD5E1", background: "white" }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { roadmapNode: RoadmapNode as unknown as NodeTypes["roadmapNode"] };

export default function FlowCanvas({
  pathData,
  pathProgress,
  filterStatus,
  selectedNodeId,
  onNodeClick,
  onPaneClick,
}: FlowCanvasProps) {
  const initialNodes: Node[] = useMemo(() => {
    return pathData.nodes
      .filter((n) => {
        if (filterStatus === "all") return true;
        const s = pathProgress[n.id] ?? "not_started";
        return s === filterStatus;
      })
      .map((n) => ({
        id: n.id,
        type: "roadmapNode",
        position: n.position,
        data: {
          label: n.title,
          status: pathProgress[n.id] ?? "not_started",
          level: n.level,
          tags: n.tags,
          onClick: () => onNodeClick(n.id),
        },
        selected: n.id === selectedNodeId,
      }));
  }, [pathData, pathProgress, filterStatus, selectedNodeId, onNodeClick]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    pathData.nodes.forEach((n) => {
      n.connections.forEach((targetId) => {
        if (pathData.nodes.some((nn) => nn.id === targetId)) {
          edges.push({
            id: `${n.id}-${targetId}`,
            source: n.id,
            target: targetId,
            animated: (pathProgress[n.id] ?? "not_started") === "learning",
            style: { stroke: "#CBD5E1", strokeWidth: 2 },
          });
        }
      });
    });
    return edges;
  }, [pathData, pathProgress]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onPaneClick={onPaneClick}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const s = (n.data as { status: NodeStatus }).status;
            if (s === "done") return "#10B981";
            if (s === "learning") return "#2563EB";
            return "#E2E8F0";
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: 12,
        padding: "8px 16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        fontSize: 12,
        color: "#64748B",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E2E8F0", border: "1px solid #CBD5E1", display: "inline-block" }} />
          Not Started
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
          Learning
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
          Done
        </span>
      </div>
    </div>
  );
}
