import { NextRequest, NextResponse } from "next/server";
import { createFolder } from "@/lib/docs";
import { slugify } from "@/lib/utils";

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

    const slug = slugify(name);
    const success = createFolder(slug);

    if (!success) {
      return NextResponse.json(
        { error: "La carpeta ya existe" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Error al crear carpeta" },
      { status: 500 }
    );
  }
}
