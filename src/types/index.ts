export interface DocFile {
  id: string;
  title: string;
  slug: string;
  content: string;
  folder: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

export interface Folder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  order: number;
}

export interface DocMeta {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  folder: string;
  excerpt: string;
  matchScore: number;
}

export interface TreeNode {
  id: string;
  name: string;
  slug: string;
  type: "folder" | "file";
  children?: TreeNode[];
  path: string;
}
