"use client";

import { Download, FileText, File, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FileViewerProps {
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  title: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileViewer({ fileUrl, fileType, fileSize, title }: FileViewerProps) {
  const isImage = fileType?.startsWith("image/");
  const isPdf = fileType === "application/pdf";
  const isVideo = fileType?.startsWith("video/");
  const isAudio = fileType?.startsWith("audio/");

  // Image preview
  if (isImage) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <img
            src={fileUrl}
            alt={title}
            className="max-w-full h-auto mx-auto"
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </p>
              <p className="text-xs text-slate-500">
                {fileType} {fileSize && `• ${formatFileSize(fileSize)}`}
              </p>
            </div>
          </div>
          <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // PDF preview
  if (isPdf) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            className="w-full h-[90vh] min-h-[800px]"
            title={title}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </p>
              <p className="text-xs text-slate-500">
                PDF {fileSize && `• ${formatFileSize(fileSize)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </a>
            <a href={fileUrl} download>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Video preview
  if (isVideo) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
          <video
            src={fileUrl}
            controls
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </p>
              <p className="text-xs text-slate-500">
                Video {fileSize && `• ${formatFileSize(fileSize)}`}
              </p>
            </div>
          </div>
          <a href={fileUrl} download>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Audio preview
  if (isAudio) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <audio
            src={fileUrl}
            controls
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </p>
              <p className="text-xs text-slate-500">
                Audio {fileSize && `• ${formatFileSize(fileSize)}`}
              </p>
            </div>
          </div>
          <a href={fileUrl} download>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Generic file download
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-6">
        <File className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 mb-6">
        {fileType || "Archivo"} {fileSize && `• ${formatFileSize(fileSize)}`}
      </p>
      <div className="flex gap-3">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir
          </Button>
        </a>
        <a href={fileUrl} download>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </a>
      </div>
    </div>
  );
}
