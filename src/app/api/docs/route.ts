import { NextRequest, NextResponse } from "next/server";
import { saveDoc, getAllDocs, deleteDoc } from "@/lib/docs";
import { slugify } from "@/lib/utils";

export async function GET() {
  const docs = getAllDocs();
  return NextResponse.json({ docs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, folder } = body;

    if (!title) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    const docPath = folder ? `${folder}/${slug}` : slug;

    const metadata = {
      title,
      date: new Date().toISOString(),
    };

    saveDoc(docPath, content || `# ${title}\n\nContenido aquí...`, metadata);

    return NextResponse.json({
      success: true,
      path: docPath,
    });
  } catch (error) {
    console.error("Error creating doc:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
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
        { error: "La ruta es requerida" },
        { status: 400 }
      );
    }

    const success = deleteDoc(path);

    if (!success) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting doc:", error);
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    );
  }
}
