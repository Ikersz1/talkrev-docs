"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
}

interface UploadedFile {
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function UploadModal({ isOpen, onClose, folders }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [folder, setFolder] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const mdFiles = Array.from(selectedFiles).filter((f) =>
      f.name.endsWith(".md")
    );

    if (mdFiles.length === 0) {
      alert("Por favor selecciona archivos .md");
      return;
    }

    setFiles(
      mdFiles.map((f) => ({
        name: f.name,
        status: "pending" as const,
      }))
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const input = fileInputRef.current;
    if (!input?.files) return;

    const fileArray = Array.from(input.files).filter((f) =>
      f.name.endsWith(".md")
    );

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        const content = await file.text();
        
        // Extract title from first # heading or filename
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch
          ? titleMatch[1]
          : file.name.replace(".md", "").replace(/-/g, " ");

        const res = await fetch("/api/docs/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            folder: folder || undefined,
            filename: file.name,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al subir");
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "success" as const } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Error",
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    router.refresh();
  };

  const handleClose = () => {
    setFiles([]);
    setFolder("");
    onClose();
  };

  const allDone = files.length > 0 && files.every((f) => f.status !== "pending" && f.status !== "uploading");
  const hasSuccess = files.some((f) => f.status === "success");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Subir Archivos Markdown
          </h2>
        </div>

        {/* Folder selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Carpeta destino
          </label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">Raíz</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400 mb-1">
            Arrastra archivos .md aquí o haz click
          </p>
          <p className="text-sm text-slate-500">
            Puedes subir múltiples archivos
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
                  {file.name}
                </span>
                {file.status === "uploading" && (
                  <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                )}
                {file.status === "success" && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
                {file.status === "error" && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">{file.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            {allDone ? "Cerrar" : "Cancelar"}
          </Button>
          {!allDone && (
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="flex-1 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir {files.length > 0 ? `(${files.length})` : ""}
                </>
              )}
            </Button>
          )}
          {allDone && hasSuccess && (
            <Button onClick={handleClose} className="flex-1">
              ¡Listo!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
