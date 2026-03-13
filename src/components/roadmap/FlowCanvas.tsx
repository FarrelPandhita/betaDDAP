"use client";

import { useMemo } from "react";
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

export default function FlowCanvas({
  pathData,
  pathProgress,
  filterStatus,
  selectedNodeId,
  onNodeClick,
  onPaneClick,
}: FlowCanvasProps) {
  // Filter nodes based on status
  const visibleNodes = useMemo(() => {
    return pathData.nodes.filter((n) => {
      if (filterStatus === "all") return true;
      const s = pathProgress[n.id] ?? "not_started";
      return s === filterStatus;
    });
  }, [pathData.nodes, pathProgress, filterStatus]);

  return (
    <div
      className="w-full h-full bg-slate-50 relative overflow-y-auto"
      onClick={(e) => {
        // Only trigger pane click if clicking directly on the background
        if (e.target === e.currentTarget) {
          onPaneClick();
        }
      }}
    >
      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto py-16 px-4 md:px-8 pb-32" onClick={onPaneClick}>
        
        {/* Timeline Layout */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 transform md:-translate-x-1/2 z-0"></div>

          <div className="space-y-8 md:space-y-12 relative z-10">
            {visibleNodes.map((node, index) => {
              const status = pathProgress[node.id] ?? "not_started";
              const isSelected = selectedNodeId === node.id;
              
              const statusConfig = {
                not_started: {
                  bg: "bg-white",
                  border: "border-slate-200",
                  text: "text-slate-600",
                  icon: <Circle className="w-5 h-5 text-slate-300" />,
                  hover: "hover:border-blue-300 hover:shadow-md",
                  indicator: "bg-slate-200 border-white",
                },
                learning: {
                  bg: "bg-blue-50",
                  border: "border-blue-400",
                  text: "text-blue-800",
                  icon: <Clock className="w-5 h-5 text-blue-500 animate-pulse" />,
                  hover: "hover:shadow-md",
                  indicator: "bg-blue-500 border-white",
                },
                done: {
                  bg: "bg-emerald-50",
                  border: "border-emerald-400",
                  text: "text-emerald-800",
                  icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
                  hover: "hover:shadow-md text-emerald-800",
                  indicator: "bg-emerald-500 border-white",
                },
              };

              const currentStyle = statusConfig[status];
              const isEven = index % 2 === 0;

              return (
                <div 
                  key={node.id} 
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 group ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline Node Indicator (desktop center, mobile left) */}
                  <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 ${currentStyle.indicator} shadow-sm z-20 transform -translate-x-1/2 md:mt-0 mt-6`}></div>

                  {/* Spacer for alternating layout on desktop */}
                  <div className="hidden md:block md:w-1/2"></div>
                  
                  {/* Spacer for mobile indent */}
                  <div className="w-12 shrink-0 md:hidden"></div>

                  {/* Card Content */}
                  <div className="w-full md:w-1/2">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNodeClick(node.id);
                      }}
                      className={`
                        w-full max-w-sm rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ease-out
                        ${currentStyle.bg} ${currentStyle.border} ${currentStyle.hover}
                        ${isSelected ? 'ring-4 ring-blue-500/20 border-blue-500 scale-[1.02] shadow-xl' : 'shadow-sm'}
                        ${isEven ? 'md:ml-auto md:mr-8' : 'md:ml-8'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`font-bold text-lg leading-tight ${currentStyle.text}`}>
                          {node.title}
                        </h3>
                        <div className="shrink-0 ml-3 bg-white/60 p-1.5 rounded-full border border-black/5">
                          {currentStyle.icon}
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {node.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
                        {node.tags && node.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {node.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag} 
                                className="text-[10px] font-semibold tracking-wide uppercase px-2 py-1 bg-white/60 text-slate-500 rounded-lg border border-slate-200/60"
                              >
                                {tag}
                              </span>
                            ))}
                            {node.tags.length > 2 && (
                              <span className="text-[10px] font-semibold px-2 py-1 bg-white/60 text-slate-500 rounded-lg border border-slate-200/60">
                                +{node.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          node.level === 'beginner' ? 'bg-emerald-100/50 text-emerald-700' :
                          node.level === 'intermediate' ? 'bg-blue-100/50 text-blue-700' :
                          'bg-orange-100/50 text-orange-700'
                        }`}>
                          {node.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleNodes.length === 0 && (
            <div className="text-center py-20 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Circle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada topik</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Silakan ubah filter status untuk melihat topik dengan status lain.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend - Fixed at bottom left */}
      <div className="fixed bottom-6 left-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl z-50">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 md:mb-0 md:mr-2">Status</h4>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white shadow-sm" />
          Not Started
        </div>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30 animate-pulse" />
          Learning
        </div>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
          Done
        </div>
      </div>
    </div>
  );
}
