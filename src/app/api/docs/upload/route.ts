import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const fileName = file.name;
    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size;
    const isMarkdown = fileName.endsWith(".md");

    // Generate slug from title or filename
    const docTitle = title || fileName.replace(/\.[^/.]+$/, "").replace(/-/g, " ");
    const slug = slugify(docTitle);

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

    // Upload file to Supabase Storage
    const storagePath = folder 
      ? `${folder}/${Date.now()}-${fileName}`
      : `${Date.now()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Error al subir archivo" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // For markdown files, also store the content
    let content: string | null = null;
    if (isMarkdown) {
      content = await file.text();
      
      // Extract title from first # heading if not provided
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          // docTitle is already set, but we could update it here
        }
      }
    }

    // Check if document already exists
    let query = supabase
      .from("documents")
      .select("id")
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
          title: docTitle,
          content: content,
          file_url: fileUrl,
          file_type: fileType,
          file_size: fileSize,
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
        fileUrl,
        updated: true,
      });
    }

    // Create new document
    const { error } = await supabase.from("documents").insert({
      title: docTitle,
      slug,
      content: content,
      folder_id: folderId,
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize,
    });

    if (error) {
      console.error("Error creating document:", error);
      
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
      fileUrl,
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
