import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import * as pdfParse from "pdf-parse";

// Sanitize filename for Supabase Storage
function sanitizeFileName(name: string): string {
  // Get extension
  const ext = name.split(".").pop() || "";
  const baseName = name.replace(`.${ext}`, "");
  
  // Remove or replace invalid characters
  const sanitized = baseName
    .replace(/[[\]{}()<>]/g, "") // Remove brackets
    .replace(/[^a-zA-Z0-9._-\s]/g, "") // Keep only safe chars
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .replace(/_+/g, "_") // Remove duplicate underscores
    .trim();
  
  return `${sanitized}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const originalFileName = file.name;
    const fileName = sanitizeFileName(originalFileName);
    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size;
    const isMarkdown = originalFileName.endsWith(".md");
    const isPdf = fileType === "application/pdf" || originalFileName.endsWith(".pdf");

    // Generate slug from title or filename
    const docTitle = title || originalFileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
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
        { error: "Error uploading file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // Extract content from files
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
    } else if (isPdf) {
      // Extract text from PDF
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse.default(buffer);
        content = pdfData.text;
        
        // If no title provided, try to extract from first line or use filename
        if (!title && pdfData.text) {
          const firstLine = pdfData.text.split('\n').find((line: string) => line.trim().length > 0);
          if (firstLine && firstLine.trim().length < 100) {
            // Could use first line as title, but for now we'll use filename
          }
        }
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        // Continue without content - PDF will still be uploaded but won't be searchable in chat
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
          { error: "Error updating document" },
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
          { error: "A document with that name already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Error creating document" },
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
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
