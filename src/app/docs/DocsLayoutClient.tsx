"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/docs/Sidebar";
import { SearchModal } from "@/components/docs/SearchModal";
import { NewDocModal } from "@/components/docs/NewDocModal";
import { NewFolderModal } from "@/components/docs/NewFolderModal";
import { UploadModal } from "@/components/docs/UploadModal";
import { TreeNode } from "@/types";

interface DocsLayoutClientProps {
  tree: TreeNode[];
  children: React.ReactNode;
}

// Recursively extract all folders from tree
function extractFolders(nodes: TreeNode[], parentPath = ""): { id: string; name: string; slug: string; path: string }[] {
  const folders: { id: string; name: string; slug: string; path: string }[] = [];
  
  for (const node of nodes) {
    if (node.type === "folder") {
      const path = parentPath ? `${parentPath}/${node.slug}` : node.slug;
      folders.push({
        id: node.id,
        name: parentPath ? `${parentPath} / ${node.name}` : node.name,
        slug: node.slug,
        path,
      });
      
      // Recursively get child folders
      if (node.children) {
        folders.push(...extractFolders(node.children, path));
      }
    }
  }
  
  return folders;
}

export function DocsLayoutClient({ tree, children }: DocsLayoutClientProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Get all folders with full path info
  const allFolders = extractFolders(tree);
  
  // Get folder slugs for doc/upload modals
  const folderSlugs = allFolders.map((f) => f.path);

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
        onUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1 lg:ml-0">{children}</main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NewDocModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        folders={folderSlugs}
      />
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        folders={allFolders}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folderSlugs}
      />
    </div>
  );
}
