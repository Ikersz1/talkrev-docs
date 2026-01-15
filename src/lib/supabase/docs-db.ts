import { createServerSupabaseClient } from "./server";
import { TreeNode, SearchResult, DocFile } from "@/types";
import { Document, Folder } from "./types";

// =============================================
// TREE STRUCTURE
// =============================================

export async function getDocsTreeFromDB(): Promise<TreeNode[]> {
  const supabase = await createServerSupabaseClient();

  // Fetch folders
  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .order("order", { ascending: true });

  // Fetch documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (!folders || !documents) {
    return [];
  }

  // Build folder path map for nested folders
  const folderPathMap = new Map<string, string>();
  
  function getFolderPath(folderId: string): string {
    if (folderPathMap.has(folderId)) {
      return folderPathMap.get(folderId)!;
    }
    
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return "";
    
    if (folder.parent_id) {
      const parentPath = getFolderPath(folder.parent_id);
      const path = parentPath ? `${parentPath}/${folder.slug}` : folder.slug;
      folderPathMap.set(folderId, path);
      return path;
    }
    
    folderPathMap.set(folderId, folder.slug);
    return folder.slug;
  }

  // Pre-calculate all folder paths
  folders.forEach((f) => getFolderPath(f.id));

  // Recursive function to build folder tree
  function buildFolderNode(folder: typeof folders[0]): TreeNode {
    const folderPath = getFolderPath(folder.id);
    
    // Get documents in this folder
    const folderDocs = documents.filter((doc) => doc.folder_id === folder.id);
    
    // Get child folders
    const childFolders = folders.filter((f) => f.parent_id === folder.id);
    
    const children: TreeNode[] = [
      // Child folders first
      ...childFolders.map((childFolder) => buildFolderNode(childFolder)),
      // Then documents
      ...folderDocs.map((doc) => ({
        id: doc.id,
        name: doc.title,
        slug: doc.slug,
        type: "file" as const,
        path: `${folderPath}/${doc.slug}`,
      })),
    ];

    return {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      type: "folder",
      path: folderPath,
      children,
    };
  }

  // Build tree starting with root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parent_id);
  const tree: TreeNode[] = rootFolders.map((folder) => buildFolderNode(folder));

  // Add root-level documents (no folder)
  const rootDocs = documents.filter((doc) => !doc.folder_id);
  for (const doc of rootDocs) {
    tree.push({
      id: doc.id,
      name: doc.title,
      slug: doc.slug,
      type: "file",
      path: doc.slug,
    });
  }

  return tree;
}

// =============================================
// DOCUMENT OPERATIONS
// =============================================

export async function getDocByPathFromDB(docPath: string): Promise<DocFile | null> {
  const supabase = await createServerSupabaseClient();
  
  const pathParts = docPath.split("/");
  const slug = pathParts.pop() || "";
  const folderSlug = pathParts.length > 0 ? pathParts[0] : null;

  let query = supabase
    .from("documents")
    .select(`
      *,
      folders!left(slug, name)
    `)
    .eq("slug", slug)
    .eq("is_published", true);

  if (folderSlug) {
    // Need to join with folders to filter by folder slug
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("slug", folderSlug)
      .single();

    if (folder) {
      query = query.eq("folder_id", folder.id);
    } else {
      return null;
    }
  } else {
    query = query.is("folder_id", null);
  }

  const { data: doc, error } = await query.single();

  if (error || !doc) {
    return null;
  }

  const folder = (doc as Document & { folders?: Folder | null }).folders;

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    content: doc.content || "",
    folder: folder?.slug || "",
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
    author: doc.author_name || undefined,
    fileUrl: doc.file_url || undefined,
    fileType: doc.file_type || undefined,
    fileSize: doc.file_size || undefined,
  };
}

export async function getAllDocsFromDB(): Promise<DocFile[]> {
  const supabase = await createServerSupabaseClient();

  const { data: documents } = await supabase
    .from("documents")
    .select(`
      *,
      folders!left(slug)
    `)
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (!documents) {
    return [];
  }

  return documents.map((doc) => {
    const folder = (doc as Document & { folders?: { slug: string } | null }).folders;
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      content: doc.content || "",
      folder: folder?.slug || "",
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
      author: doc.author_name || undefined,
    };
  });
}

export async function saveDocToDB(
  docPath: string,
  content: string,
  metadata: { title?: string; author?: string } = {}
): Promise<{ success: boolean; path: string }> {
  const supabase = await createServerSupabaseClient();

  const pathParts = docPath.split("/");
  const slug = pathParts.pop() || "";
  const folderSlug = pathParts.length > 0 ? pathParts[0] : null;

  let folderId: string | null = null;

  if (folderSlug) {
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("slug", folderSlug)
      .single();

    folderId = folder?.id || null;
  }

  // Check if document exists
  let query = supabase
    .from("documents")
    .select("id")
    .eq("slug", slug);

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else {
    query = query.is("folder_id", null);
  }

  const { data: existingDoc } = await query.single();

  if (existingDoc) {
    // Update existing document
    const { error } = await supabase
      .from("documents")
      .update({
        content,
        title: metadata.title,
        author_name: metadata.author,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingDoc.id);

    if (error) {
      console.error("Error updating document:", error);
      return { success: false, path: docPath };
    }
  } else {
    // Create new document
    const { error } = await supabase.from("documents").insert({
      title: metadata.title || slug.replace(/-/g, " "),
      slug,
      content,
      folder_id: folderId,
      author_name: metadata.author,
    });

    if (error) {
      console.error("Error creating document:", error);
      return { success: false, path: docPath };
    }
  }

  return { success: true, path: docPath };
}

export async function deleteDocFromDB(docPath: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const pathParts = docPath.split("/");
  const slug = pathParts.pop() || "";
  const folderSlug = pathParts.length > 0 ? pathParts[0] : null;

  let folderId: string | null = null;

  if (folderSlug) {
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("slug", folderSlug)
      .single();

    folderId = folder?.id || null;
  }

  let query = supabase.from("documents").delete().eq("slug", slug);

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else {
    query = query.is("folder_id", null);
  }

  const { error } = await query;

  return !error;
}

// =============================================
// FOLDER OPERATIONS
// =============================================

export async function createFolderInDB(name: string): Promise<{ success: boolean; slug: string }> {
  const supabase = await createServerSupabaseClient();

  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  const { error } = await supabase.from("folders").insert({
    name,
    slug,
  });

  if (error) {
    console.error("Error creating folder:", error);
    return { success: false, slug: "" };
  }

  return { success: true, slug };
}

export async function getFoldersFromDB(): Promise<Folder[]> {
  const supabase = await createServerSupabaseClient();

  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .order("order", { ascending: true });

  return folders || [];
}

// =============================================
// SEARCH
// =============================================

export async function searchDocsInDB(query: string): Promise<SearchResult[]> {
  const supabase = await createServerSupabaseClient();

  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  // Search in documents
  const { data: docs, error } = await supabase
    .from("documents")
    .select(`
      id,
      title,
      slug,
      content,
      folder_id,
      folders!left(slug)
    `)
    .eq("is_published", true)
    .or(`title.ilike."${searchTerm}",content.ilike."${searchTerm}"`)
    .limit(20);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  if (!docs || docs.length === 0) {
    return [];
  }

  return docs.map((doc) => {
    const folder = (doc as Document & { folders?: { slug: string } | null }).folders;
    const content = doc.content || "";
    const queryLower = query.toLowerCase();
    const titleLower = doc.title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Find best match position
    const titleMatch = titleLower.includes(queryLower);
    const contentMatchIndex = contentLower.indexOf(queryLower);
    
    // Calculate match score
    let matchScore = 0;
    if (titleMatch) matchScore += 10;
    if (contentMatchIndex >= 0) matchScore += 5;
    
    // Generate excerpt
    let excerpt = "";
    if (contentMatchIndex >= 0) {
      const start = Math.max(0, contentMatchIndex - 50);
      const end = Math.min(content.length, contentMatchIndex + query.length + 100);
      excerpt = (start > 0 ? "..." : "") + content.slice(start, end) + (end < content.length ? "..." : "");
    } else if (titleMatch) {
      excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");
    } else {
      excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");
    }

    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      folder: folder?.slug || "",
      excerpt,
      matchScore,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
