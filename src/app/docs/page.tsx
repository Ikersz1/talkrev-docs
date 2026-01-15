import Link from "next/link";
import { BookOpen, FolderOpen, FileText, Plus, ArrowRight } from "lucide-react";
import { getDocsTree } from "@/lib/docs";
import { TreeNode } from "@/types";

export default function DocsIndexPage() {
  const tree = getDocsTree();

  if (tree.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            ¡Bienvenido a la Documentación!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Aún no hay documentos. Crea tu primer documento usando el botón en la barra lateral.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Plus className="h-4 w-4" />
            <span>Usa "Nuevo Doc" para empezar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Documentación
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Explora la documentación por categorías o usa la búsqueda para encontrar lo que necesitas.
        </p>
      </div>

      <div className="space-y-8">
        {tree.map((node) => (
          <CategorySection key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ node }: { node: TreeNode }) {
  if (node.type === "file") {
    return (
      <Link
        href={`/docs/${node.path}`}
        className="block p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {node.name}
            </h3>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <FolderOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {node.name}
        </h2>
        <span className="ml-auto text-sm text-slate-500">
          {node.children?.length || 0} docs
        </span>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {node.children.map((child) => (
            <Link
              key={child.id}
              href={`/docs/${child.path}`}
              className="flex items-center gap-4 p-4 pl-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="flex-1 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {child.name}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
