"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Edit3, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MarkdownViewer } from "./MarkdownViewer";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  initialContent: string;
  docPath: string;
  title: string;
}

export function MarkdownEditor({ initialContent, docPath, title }: MarkdownEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);

  useEffect(() => {
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && !isPreview) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(500, textarea.scrollHeight)}px`;
    }
  }, [content, isPreview]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setIsPreview(!isPreview);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, isPreview]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/docs/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: docPath,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar");
      }

      setSaveStatus("saved");
      setHasChanges(false);
      
      // Clear status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">
                {title}
              </h1>
              <p className="text-sm text-slate-500">
                {hasChanges ? "Unsaved changes" : "Editing document"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle view */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1">
              <button
                onClick={() => setIsPreview(false)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  !isPreview
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Edit3 className="h-4 w-4 inline mr-1.5" />
                Edit
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isPreview
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Eye className="h-4 w-4 inline mr-1.5" />
                Preview
              </button>
            </div>

            {/* Save status */}
            {saveStatus === "saved" && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                ✓ Guardado
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-600 dark:text-red-400">
                Error al guardar
              </span>
            )}

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Editor / Preview */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {isPreview ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <MarkdownViewer content={content} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
            className="w-full min-h-[500px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            spellCheck={false}
          />
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-400 space-x-4">
        <span>⌘S save</span>
        <span>⌘P preview</span>
      </div>
    </div>
  );
}
