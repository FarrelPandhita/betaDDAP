"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NodeStatus = "not_started" | "learning" | "done";

export type ProgressState = {
  [pathId: string]: {
    [nodeId: string]: NodeStatus;
  };
};

interface ProgressStore {
  progress: ProgressState;
  activePathId: string | null;
  setActivePathId: (pathId: string) => void;
  setNodeStatus: (pathId: string, nodeId: string, status: NodeStatus) => void;
  resetPath: (pathId: string) => void;
  resetAll: () => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
  getPathStats: (pathId: string, totalNodes: number) => {
    done: number;
    learning: number;
    notStarted: number;
    percent: number;
  };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},
      activePathId: null,

      setActivePathId: (pathId) => set({ activePathId: pathId }),

      setNodeStatus: (pathId, nodeId, status) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [pathId]: {
              ...(state.progress[pathId] || {}),
              [nodeId]: status,
            },
          },
        })),

      resetPath: (pathId) =>
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[pathId];
          return { progress: newProgress };
        }),

      resetAll: () => set({ progress: {}, activePathId: null }),

      exportProgress: () => {
        const data = {
          exported_at: new Date().toISOString(),
          version: "1.0",
          progress: get().progress,
        };
        return JSON.stringify(data, null, 2);
      },

      importProgress: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.progress && typeof data.progress === "object") {
            set({ progress: data.progress });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      getPathStats: (pathId, totalNodes) => {
        const pathProgress = get().progress[pathId] || {};
        const done = Object.values(pathProgress).filter((s) => s === "done").length;
        const learning = Object.values(pathProgress).filter((s) => s === "learning").length;
        const notStarted = totalNodes - done - learning;
        const percent = totalNodes > 0 ? Math.round((done / totalNodes) * 100) : 0;
        return { done, learning, notStarted, percent };
      },
    }),
    {
      name: "devpath-progress",
    }
  )
);
