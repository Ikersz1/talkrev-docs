import { getDocsTreeFromDB } from "@/lib/supabase/docs-db";
import { DocsLayoutClient } from "./DocsLayoutClient";

export const dynamic = "force-dynamic";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = await getDocsTreeFromDB();

  return <DocsLayoutClient tree={tree}>{children}</DocsLayoutClient>;
}
