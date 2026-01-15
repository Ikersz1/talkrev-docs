"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle, File, Image, FileCode, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
}

interface UploadedFile {
  file: File;
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  "text/markdown": FileText,
  "text/plain": FileText,
  "application/pdf": File,
  "image/png": Image,
  "image/jpeg": Image,
  "image/gif": Image,
  "image/webp": Image,
  "text/html": FileCode,
  "text/css": FileCode,
  "text/javascript": FileCode,
  "application/json": FileCode,
  "text/csv": FileSpreadsheet,
  "application/vnd.ms-excel": FileSpreadsheet,
};

function getFileIcon(type: string): React.ElementType {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("text/")) return FileText;
  return FILE_ICONS[type] || File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadModal({ isOpen, onClose, folders }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [folder, setFolder] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles).map((f) => ({
      file: f,
      name: f.name,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i];
      
      if (uploadFile.status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", uploadFile.file);
        if (folder) {
          formData.append("folder", folder);
        }

        const res = await fetch("/api/docs/upload", {
          method: "POST",
          body: formData,
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

  const pendingFiles = files.filter((f) => f.status === "pending");
  const allDone = files.length > 0 && pendingFiles.length === 0 && !isUploading;
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
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Subir Archivos
            </h2>
            <p className="text-sm text-slate-500">
              .md, .pdf, imágenes, y más
            </p>
          </div>
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
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400 mb-1">
            Arrastra archivos aquí o haz click
          </p>
          <p className="text-sm text-slate-500">
            Cualquier tipo de archivo
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => {
              const Icon = getFileIcon(file.file.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <Icon className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                  {file.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                  {file.status === "uploading" && (
                    <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                  )}
                  {file.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  )}
                  {file.status === "error" && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              );
            })}
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
              disabled={pendingFiles.length === 0 || isUploading}
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
                  Subir {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ""}
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
