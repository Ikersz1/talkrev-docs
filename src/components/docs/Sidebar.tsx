"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, FolderPlus, Menu, X, BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TreeView } from "./TreeView";
import { TreeNode } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tree: TreeNode[];
  onSearch: () => void;
  onNewDoc?: () => void;
  onNewFolder?: () => void;
  onUpload?: () => void;
}

export function Sidebar({ tree, onSearch, onNewDoc, onNewFolder, onUpload }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-0 h-screen w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              TalkRev Docs
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search button */}
        <div className="p-4">
          <button
            onClick={onSearch}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search documents...</span>
            <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-1.5 text-xs text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewDoc}
              className="flex-1 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Doc
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewFolder}
              className="gap-2"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpload}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload files
          </Button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {tree.length > 0 ? (
            <TreeView nodes={tree} />
          ) : (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm">No documents yet</p>
              <p className="text-xs mt-1">Create your first document</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
