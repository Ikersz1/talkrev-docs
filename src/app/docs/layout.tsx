import { getDocsTree } from "@/lib/docs";
import { DocsLayoutClient } from "./DocsLayoutClient";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = getDocsTree();

  return <DocsLayoutClient tree={tree}>{children}</DocsLayoutClient>;
}
