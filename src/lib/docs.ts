import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { DocFile, TreeNode, SearchResult } from "@/types";

const DOCS_PATH = path.join(process.cwd(), "docs");

export function getDocsTree(): TreeNode[] {
  function buildTree(dirPath: string, basePath: string = ""): TreeNode[] {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        nodes.push({
          id: relativePath,
          name: formatFolderName(item.name),
          slug: item.name,
          type: "folder",
          path: relativePath,
          children: buildTree(itemPath, relativePath),
        });
      } else if (item.name.endsWith(".md")) {
        const slug = item.name.replace(".md", "");
        const content = fs.readFileSync(itemPath, "utf-8");
        const { data } = matter(content);

        nodes.push({
          id: relativePath,
          name: data.title || formatFileName(slug),
          slug,
          type: "file",
          path: relativePath.replace(".md", ""),
        });
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  if (!fs.existsSync(DOCS_PATH)) {
    fs.mkdirSync(DOCS_PATH, { recursive: true });
  }

  return buildTree(DOCS_PATH);
}

export function getDocByPath(docPath: string): DocFile | null {
  const fullPath = path.join(DOCS_PATH, `${docPath}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const { data, content: markdown } = matter(content);
  const stats = fs.statSync(fullPath);

  const pathParts = docPath.split("/");
  const slug = pathParts.pop() || "";
  const folder = pathParts.join("/");

  return {
    id: docPath,
    title: data.title || formatFileName(slug),
    slug,
    content: markdown,
    folder,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    author: data.author,
  };
}

export function getAllDocs(): DocFile[] {
  const docs: DocFile[] = [];

  function collectDocs(dirPath: string, basePath: string = "") {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        collectDocs(itemPath, relativePath);
      } else if (item.name.endsWith(".md")) {
        const doc = getDocByPath(relativePath.replace(".md", ""));
        if (doc) docs.push(doc);
      }
    }
  }

  if (fs.existsSync(DOCS_PATH)) {
    collectDocs(DOCS_PATH);
  }

  return docs;
}

export function searchDocs(query: string): SearchResult[] {
  const docs = getAllDocs();
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const doc of docs) {
    const titleMatch = doc.title.toLowerCase().includes(queryLower);
    const contentMatch = doc.content.toLowerCase().includes(queryLower);

    if (titleMatch || contentMatch) {
      let excerpt = "";
      let matchScore = 0;

      if (titleMatch) {
        matchScore += 10;
        excerpt = doc.content.slice(0, 150) + "...";
      }

      if (contentMatch) {
        matchScore += 5;
        const index = doc.content.toLowerCase().indexOf(queryLower);
        const start = Math.max(0, index - 50);
        const end = Math.min(doc.content.length, index + query.length + 100);
        excerpt = (start > 0 ? "..." : "") + doc.content.slice(start, end) + (end < doc.content.length ? "..." : "");
      }

      results.push({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        folder: doc.folder,
        excerpt,
        matchScore,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function saveDoc(docPath: string, content: string, metadata: Record<string, unknown> = {}): boolean {
  const fullPath = path.join(DOCS_PATH, `${docPath}.md`);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileContent = matter.stringify(content, metadata);
  fs.writeFileSync(fullPath, fileContent, "utf-8");
  return true;
}

export function deleteDoc(docPath: string): boolean {
  const fullPath = path.join(DOCS_PATH, `${docPath}.md`);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }

  return false;
}

export function createFolder(folderPath: string): boolean {
  const fullPath = path.join(DOCS_PATH, folderPath);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  }

  return false;
}

function formatFolderName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFileName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
