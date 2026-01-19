import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get all PDFs without content
    const { data: pdfs, error: fetchError } = await supabase
      .from("documents")
      .select("id, title, file_url, file_type")
      .eq("is_published", true)
      .eq("file_type", "application/pdf")
      .is("content", null);

    if (fetchError) {
      return NextResponse.json(
        { error: "Error fetching PDFs" },
        { status: 500 }
      );
    }

    if (!pdfs || pdfs.length === 0) {
      return NextResponse.json({
        message: "No PDFs to process",
        processed: 0,
      });
    }

    let processed = 0;
    let errors = 0;

    // Process each PDF
    for (const pdf of pdfs) {
      if (!pdf.file_url) continue;

      try {
        // Download PDF from Supabase Storage
        const response = await fetch(pdf.file_url);
        if (!response.ok) {
          console.error(`Failed to fetch PDF: ${pdf.file_url}`);
          errors++;
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text
        // Use dynamic import with proper type handling
        const pdfParseModule: any = await import("pdf-parse");
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const pdfData = await pdfParse(buffer);

        // Update document with extracted text
        const { error: updateError } = await supabase
          .from("documents")
          .update({ content: pdfData.text })
          .eq("id", pdf.id);

        if (updateError) {
          console.error(`Error updating PDF ${pdf.id}:`, updateError);
          errors++;
        } else {
          processed++;
        }
      } catch (error) {
        console.error(`Error processing PDF ${pdf.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} PDFs, ${errors} errors`,
      processed,
      errors,
      total: pdfs.length,
    });
  } catch (error) {
    console.error("Process PDFs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
