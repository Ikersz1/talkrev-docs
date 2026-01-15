import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Edit3, Download } from "lucide-react";
import { getDocByPathFromDB } from "@/lib/supabase/docs-db";
import { MarkdownViewer } from "@/components/docs/MarkdownViewer";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { FileViewer } from "@/components/docs/FileViewer";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const docPath = resolvedParams.slug.join("/");
  const doc = await getDocByPathFromDB(docPath);

  if (!doc) {
    notFound();
  }

  const pathParts = docPath.split("/");
  const isMarkdown = !doc.fileType || doc.fileType === "text/markdown" || doc.fileType.startsWith("text/");
  const hasContent = doc.content && doc.content.trim().length > 0;

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-4xl mx-auto p-8 lg:p-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link
            href="/docs"
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Docs
          </Link>
          {pathParts.map((part, index) => (
            <span key={index} className="flex items-center gap-2">
              <span>/</span>
              {index === pathParts.length - 1 ? (
                <span className="text-slate-900 dark:text-white font-medium">
                  {doc.title}
                </span>
              ) : (
                <Link
                  href={`/docs/${pathParts.slice(0, index + 1).join("/")}`}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors capitalize"
                >
                  {part.replace(/-/g, " ")}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Back link */}
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la documentación
        </Link>

        {/* Title for non-markdown files */}
        {!isMarkdown && (
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {doc.title}
          </h1>
        )}

        {/* Content */}
        <article>
          {isMarkdown && hasContent ? (
            <MarkdownViewer content={doc.content} />
          ) : doc.fileUrl ? (
            <FileViewer
              fileUrl={doc.fileUrl}
              fileType={doc.fileType || "application/octet-stream"}
              fileSize={doc.fileSize}
              title={doc.title}
            />
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p>Este documento no tiene contenido</p>
            </div>
          )}
        </article>

        {/* Metadata */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            {doc.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{doc.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Actualizado {formatDate(doc.updatedAt)}</span>
            </div>
            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                download
                className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline"
              >
                <Download className="h-4 w-4" />
                Descargar archivo
              </a>
            )}
            {isMarkdown && hasContent && (
              <Link
                href={`/docs/edit/${docPath}`}
                className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline ml-auto"
              >
                <Edit3 className="h-4 w-4" />
                Editar página
              </Link>
            )}
          </div>
        </footer>
      </div>

      {/* Table of contents - only for markdown */}
      {isMarkdown && hasContent && (
        <aside className="hidden xl:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto p-8">
          <TableOfContents content={doc.content} />
        </aside>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
