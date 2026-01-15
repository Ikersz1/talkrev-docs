import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, folder, filename } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título y contenido son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Generate slug from title or filename
    const slug = slugify(title) || slugify(filename?.replace(".md", "") || "documento");

    // Get folder ID if folder is specified
    let folderId: string | null = null;
    if (folder) {
      const { data: folderData } = await supabase
        .from("folders")
        .select("id")
        .eq("slug", folder)
        .single();

      folderId = folderData?.id || null;
    }

    // Check if document already exists
    let query = supabase
      .from("documents")
      .select("id, slug")
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
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDoc.id);

      if (error) {
        console.error("Error updating document:", error);
        return NextResponse.json(
          { error: "Error al actualizar documento" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        path: folder ? `${folder}/${slug}` : slug,
        updated: true,
      });
    }

    // Create new document
    const { error } = await supabase.from("documents").insert({
      title,
      slug,
      content,
      folder_id: folderId,
    });

    if (error) {
      console.error("Error creating document:", error);
      
      // Check if it's a unique constraint error
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un documento con ese nombre" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Error al crear documento" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: folder ? `${folder}/${slug}` : slug,
      created: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar archivo" },
      { status: 500 }
    );
  }
}
