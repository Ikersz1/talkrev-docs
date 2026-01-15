import { NextRequest, NextResponse } from "next/server";
import { saveDocToDB, getAllDocsFromDB, deleteDocFromDB } from "@/lib/supabase/docs-db";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const docs = await getAllDocsFromDB();
    return NextResponse.json({ docs });
  } catch (error) {
    console.error("Error fetching docs:", error);
    return NextResponse.json({ docs: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, folder } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    const docPath = folder ? `${folder}/${slug}` : slug;

    const result = await saveDocToDB(
      docPath,
      content || `# ${title}\n\nContenido aquí...`,
      { title }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Error creating document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: result.path,
    });
  } catch (error) {
    console.error("Error creating doc:", error);
    return NextResponse.json(
        { error: "Error creating document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    const success = await deleteDocFromDB(path);

    if (!success) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting doc:", error);
    return NextResponse.json(
        { error: "Error deleting document" },
      { status: 500 }
    );
  }
}
