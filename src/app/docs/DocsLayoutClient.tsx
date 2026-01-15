"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/docs/Sidebar";
import { SearchModal } from "@/components/docs/SearchModal";
import { NewDocModal } from "@/components/docs/NewDocModal";
import { NewFolderModal } from "@/components/docs/NewFolderModal";
import { TreeNode } from "@/types";

interface DocsLayoutClientProps {
  tree: TreeNode[];
  children: React.ReactNode;
}

export function DocsLayoutClient({ tree, children }: DocsLayoutClientProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  // Get folder names for the new doc modal
  const folders = tree
    .filter((node) => node.type === "folder")
    .map((node) => node.slug);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        tree={tree}
        onSearch={() => setIsSearchOpen(true)}
        onNewDoc={() => setIsNewDocOpen(true)}
        onNewFolder={() => setIsNewFolderOpen(true)}
      />

      <main className="flex-1 lg:ml-0">{children}</main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NewDocModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        folders={folders}
      />
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
      />
    </div>
  );
}
