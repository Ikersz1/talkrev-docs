import { NextRequest, NextResponse } from "next/server";
import { createFolderInDB, getFoldersFromDB } from "@/lib/supabase/docs-db";

export async function GET() {
  try {
    const folders = await getFoldersFromDB();
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ folders: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const result = await createFolderInDB(name);

    if (!result.success) {
      return NextResponse.json(
        { error: "La carpeta ya existe o hubo un error" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      slug: result.slug,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Error al crear carpeta" },
      { status: 500 }
    );
  }
}
