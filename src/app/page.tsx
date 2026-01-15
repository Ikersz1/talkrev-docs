import Link from "next/link";
import { BookOpen, Search, FolderTree, Upload, Zap, Users } from "lucide-react";
import { getDocsTreeFromDB } from "@/lib/supabase/docs-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tree = await getDocsTreeFromDB();
  const totalDocs = countDocs(tree);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent dark:from-violet-900/20" />
        
        <nav className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              TalkRev Docs
            </span>
          </div>
          <Link
            href="/docs"
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            View Documentation
          </Link>
        </nav>

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {totalDocs} documents available
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Documentation
            <span className="block mt-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              for the TalkRev team
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Everything you need to know about our projects, APIs, guides, and procedures. Centralized and always up to date.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all"
            >
              <BookOpen className="h-5 w-5" />
              Explore Docs
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:-translate-y-0.5 transition-all"
            >
              <Search className="h-5 w-5" />
              Search (⌘K)
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={FolderTree}
            title="Folder Organization"
            description="Structure your documents in folders to keep everything organized and easy to find."
            color="amber"
          />
          <FeatureCard
            icon={Upload}
            title="Markdown Nativo"
            description="Write documents in Markdown with support for code, tables, images, and more."
            color="violet"
          />
          <FeatureCard
            icon={Zap}
            title="Búsqueda Instantánea"
            description="Find any document in seconds with our real-time search."
            color="emerald"
          />
        </div>
      </section>

      {/* Quick links */}
      {tree.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Acceso Rápido
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tree.slice(0, 6).map((node) => (
              <Link
                key={node.id}
                href={node.type === "folder" ? `/docs/${node.slug}` : `/docs/${node.path}`}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    node.type === "folder" 
                      ? "bg-amber-100 dark:bg-amber-900/30" 
                      : "bg-violet-100 dark:bg-violet-900/30"
                  }`}>
                    {node.type === "folder" ? (
                      <FolderTree className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {node.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {node.type === "folder" ? "Folder" : "Document"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>For internal team use</span>
          </div>
          <span>TalkRev © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "amber" | "violet" | "emerald";
}) {
  const colorClasses = {
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function countDocs(nodes: { type: string; children?: { type: string; children?: unknown[] }[] }[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count++;
    if (node.children) count += countDocs(node.children as { type: string; children?: { type: string; children?: unknown[] }[] }[]);
  }
  return count;
}
