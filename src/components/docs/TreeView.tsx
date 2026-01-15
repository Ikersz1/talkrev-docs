"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Folder, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreeNode } from "@/types";

interface TreeViewProps {
  nodes: TreeNode[];
  level?: number;
}

export function TreeView({ nodes, level = 0 }: TreeViewProps) {
  return (
    <ul className={cn("space-y-1", level > 0 && "ml-4 mt-1")}>
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} level={level} />
      ))}
    </ul>
  );
}

function TreeItem({ node, level }: { node: TreeNode; level: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(level < 2);
  const isActive = pathname === `/docs/${node.path}`;
  const hasChildren = node.children && node.children.length > 0;

  if (node.type === "folder") {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors",
            "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <Folder className="h-4 w-4 text-amber-500" />
          <span>{node.name}</span>
        </button>
        {isOpen && hasChildren && (
          <TreeView nodes={node.children!} level={level + 1} />
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/docs/${node.path}`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <span className="w-4" />
        <FileText className="h-4 w-4" />
        <span>{node.name}</span>
      </Link>
    </li>
  );
}
