import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: slugify(match[2]),
    });
  }

  return headings;
}

/**
 * Helper function to import pdf-parse with proper type handling
 * Works in both development and production environments
 */
export async function importPdfParse() {
  // @ts-expect-error - pdf-parse has inconsistent export types between ESM and CommonJS
  const pdfParseModule = await import("pdf-parse");
  // Handle both default export and named export
  return (pdfParseModule as any).default || pdfParseModule;
}
