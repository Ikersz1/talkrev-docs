import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: folders } = await supabase
      .from("folders")
      .select("*")
      .order("order", { ascending: true });

    return NextResponse.json({ folders: folders || [] });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ folders: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const slug = slugify(name);

    // Check if folder already exists with same slug and parent
    let query = supabase
      .from("folders")
      .select("id")
      .eq("slug", slug);

    if (parentId) {
      query = query.eq("parent_id", parentId);
    } else {
      query = query.is("parent_id", null);
    }

    const { data: existing } = await query.single();

    if (existing) {
      return NextResponse.json(
        { error: "A folder with that name already exists" },
        { status: 400 }
      );
    }

    // Create folder
    const { error } = await supabase.from("folders").insert({
      name,
      slug,
      parent_id: parentId || null,
    });

    if (error) {
      console.error("Error creating folder:", error);
      return NextResponse.json(
        { error: "Error creating folder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Error creating folder" },
      { status: 500 }
    );
  }
}
