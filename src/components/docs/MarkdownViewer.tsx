"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <article
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        // Headings
        "prose-headings:scroll-mt-20 prose-headings:font-semibold",
        "prose-h1:text-3xl prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-800 prose-h1:pb-4 prose-h1:mb-6",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8",
        // Links
        "prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline",
        // Code
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal",
        "prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800",
        // Tables
        "prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-800",
        "prose-th:bg-slate-50 dark:prose-th:bg-slate-900 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-800 prose-th:px-4 prose-th:py-2",
        "prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:px-4 prose-td:py-2",
        // Blockquotes
        "prose-blockquote:border-l-violet-500 prose-blockquote:bg-violet-50 dark:prose-blockquote:bg-violet-950/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic",
        // Lists
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:marker:text-slate-400",
        // Images
        "prose-img:rounded-lg prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
