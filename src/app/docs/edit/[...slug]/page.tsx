import { notFound } from "next/navigation";
import { getDocByPathFromDB } from "@/lib/supabase/docs-db";
import { MarkdownEditor } from "@/components/docs/MarkdownEditor";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const docPath = resolvedParams.slug.join("/");
  const doc = await getDocByPathFromDB(docPath);

  if (!doc) {
    notFound();
  }

  // Only allow editing markdown documents
  const isMarkdown = !doc.fileType || doc.fileType === "text/markdown" || doc.fileType.startsWith("text/");
  
  if (!isMarkdown || !doc.content) {
    notFound();
  }

  return (
    <MarkdownEditor
      initialContent={doc.content}
      docPath={docPath}
      title={doc.title}
    />
  );
}
