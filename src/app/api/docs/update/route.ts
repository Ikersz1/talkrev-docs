import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, content } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const pathParts = path.split("/");
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

    // Find the document
    let query = supabase
      .from("documents")
      .select("id")
      .eq("slug", slug);

    if (folderId) {
      query = query.eq("folder_id", folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: doc, error: findError } = await query.single();

    if (findError || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Extract title from content if it starts with #
    let title: string | undefined;
    const titleMatch = content?.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Update the document
    const updateData: Record<string, unknown> = {
      content,
      updated_at: new Date().toISOString(),
    };

    if (title) {
      updateData.title = title;
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", doc.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Error updating document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
