"use client";

import { useRef, useState, useCallback } from "react";
import {
  Download,
  Upload,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  FileJson,
  CheckCircle2,
  XCircle,
  Info,
  Trash2,
} from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { Button, Badge } from "@/components/ui";
import paths from "@/data/paths.json";

export default function SettingsPage() {
  const { progress, exportProgress, importProgress, resetAll, resetPath } = useProgressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetTarget, setResetTarget] = useState<string | "all">("all");
  const [isDragging, setIsDragging] = useState(false);

  // Storage info
  const progressJson = JSON.stringify(progress);
  const storageSizeKB = (new Blob([progressJson]).size / 1024).toFixed(2);
  const pathsWithProgress = paths.filter((p) => Object.keys(progress[p.path_id] || {}).length > 0);

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

  const processFile = (file: File) => {
    if (!file?.name.endsWith(".json")) {
      setImportStatus("error");
      setImportMessage("File harus berformat JSON.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const success = importProgress(text);
      if (success) {
        setImportStatus("success");
        setImportMessage("Progress berhasil diimpor.");
      } else {
        setImportStatus("error");
        setImportMessage("Format JSON tidak valid. Pastikan file dari DevPath.");
      }
      setTimeout(() => setImportStatus("idle"), 4000);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleReset = () => {
    if (resetTarget === "all") {
      resetAll();
    } else {
      resetPath(resetTarget);
    }
    setShowResetDialog(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Kelola data progress belajarmu</p>
      </div>

      {/* Storage Info */}
      <section className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary">Data Storage</h2>
            <p className="text-sm text-text-muted">Progress disimpan di browser localStorage</p>
          </div>
        </div>
        <div className="bg-surface-secondary rounded-xl p-4 border border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Storage key</span>
            <code className="text-xs font-mono bg-surface-tertiary px-2 py-0.5 rounded text-text-secondary">devpath-progress</code>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Data size</span>
            <span className="font-semibold text-text-primary">{storageSizeKB} KB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Paths with progress</span>
            <span className="font-semibold text-text-primary">{pathsWithProgress.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Last updated</span>
            <span className="font-semibold text-text-primary">{new Date().toLocaleDateString("id-ID")}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 mt-3 text-xs text-text-muted">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Data hanya disimpan di browser ini. Gunakan Export/Import untuk backup atau pindah ke perangkat lain.</span>
        </div>
      </section>

      {/* Export */}
      <section className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary">Export Progress</h2>
            <p className="text-sm text-text-muted">Download data progressmu sebagai file JSON</p>
          </div>
        </div>
        <Button onClick={handleExport} fullWidth>
          <Download className="w-4 h-4" /> Download Progress JSON
        </Button>
      </section>

      {/* Import */}
      <section className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-warning-light rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary">Import Progress</h2>
            <p className="text-sm text-text-muted">Restore progress dari file JSON yang sudah diexport</p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary-50 scale-[1.01]"
              : "border-border hover:border-primary hover:bg-surface-secondary"
          }`}
        >
          <FileJson className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-text-muted"}`} />
          <p className="font-semibold text-text-primary mb-1">
            {isDragging ? "Drop your file here!" : "Drag & drop JSON file"}
          </p>
          <p className="text-sm text-text-muted">atau klik untuk memilih file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Status */}
        {importStatus !== "idle" && (
          <div
            className={`flex items-center gap-2 mt-3 p-3 rounded-lg text-sm font-semibold ${
              importStatus === "success"
                ? "bg-success-light text-green-700"
                : "bg-danger-light text-red-700"
            }`}
          >
            {importStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {importMessage}
          </div>
        )}
      </section>

      {/* Reset */}
      <section className="card border-danger/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-danger-light rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary">Reset Progress</h2>
            <p className="text-sm text-text-muted">Hapus data progress (tidak bisa dikembalikan)</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {pathsWithProgress.map((p) => (
            <div key={p.path_id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-border">
              <span className="text-sm font-semibold text-text-primary">{p.title}</span>
              <Button
                size="sm"
                variant="ghost"
                className="!text-danger hover:!bg-danger-light"
                onClick={() => { setResetTarget(p.path_id); setShowResetDialog(true); }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="danger"
          fullWidth
          onClick={() => { setResetTarget("all"); setShowResetDialog(true); }}
          disabled={pathsWithProgress.length === 0}
        >
          <Trash2 className="w-4 h-4" /> Reset All Progress
        </Button>
      </section>

      {/* Reset Dialog */}
      {showResetDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResetDialog(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-danger-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-text-primary text-center mb-2">
              {resetTarget === "all" ? "Reset Semua Progress?" : "Reset Path ini?"}
            </h3>
            <p className="text-sm text-text-muted text-center mb-6">
              {resetTarget === "all"
                ? "Semua data progress akan dihapus permanen. Pastikan sudah di-export jika perlu."
                : `Progress untuk "${paths.find((p) => p.path_id === resetTarget)?.title}" akan dihapus.`}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowResetDialog(false)}>
                Batal
              </Button>
              <Button variant="danger" fullWidth onClick={handleReset}>
                Ya, Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
