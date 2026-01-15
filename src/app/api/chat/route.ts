import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history } = body as {
      message: string;
      context: string;
      history: Message[];
    };

    if (!message) {
      return NextResponse.json(
        { error: "Mensaje requerido" },
        { status: 400 }
      );
    }

    // Fetch relevant documentation content
    const supabase = await createServerSupabaseClient();
    let documentContent = "";

    if (context === "all") {
      // Fetch all documents
      const { data: docs } = await supabase
        .from("documents")
        .select("title, content")
        .eq("is_published", true)
        .not("content", "is", null)
        .limit(20);

      if (docs) {
        documentContent = docs
          .map((doc) => `## ${doc.title}\n${doc.content}`)
          .join("\n\n---\n\n");
      }
    } else {
      // Fetch specific document or folder
      const pathParts = context.split("/");
      
      if (pathParts.length === 1) {
        // Could be a folder slug or a root document
        const { data: folder } = await supabase
          .from("folders")
          .select("id")
          .eq("slug", pathParts[0])
          .single();

        if (folder) {
          // It's a folder - get all docs in it
          const { data: docs } = await supabase
            .from("documents")
            .select("title, content")
            .eq("folder_id", folder.id)
            .eq("is_published", true)
            .not("content", "is", null);

          if (docs) {
            documentContent = docs
              .map((doc) => `## ${doc.title}\n${doc.content}`)
              .join("\n\n---\n\n");
          }
        } else {
          // It's a root document
          const { data: doc } = await supabase
            .from("documents")
            .select("title, content")
            .eq("slug", pathParts[0])
            .is("folder_id", null)
            .single();

          if (doc) {
            documentContent = `## ${doc.title}\n${doc.content}`;
          }
        }
      } else {
        // It's a document in a folder
        const folderSlug = pathParts[0];
        const docSlug = pathParts[pathParts.length - 1];

        const { data: folder } = await supabase
          .from("folders")
          .select("id")
          .eq("slug", folderSlug)
          .single();

        if (folder) {
          const { data: doc } = await supabase
            .from("documents")
            .select("title, content")
            .eq("slug", docSlug)
            .eq("folder_id", folder.id)
            .single();

          if (doc) {
            documentContent = `## ${doc.title}\n${doc.content}`;
          }
        }
      }
    }

    // Build messages for OpenRouter
    const systemPrompt = `Eres un asistente experto en documentación técnica. Tu trabajo es responder preguntas basándote ÚNICAMENTE en la documentación proporcionada a continuación.

REGLAS:
1. Responde siempre en español
2. Sé conciso y directo
3. Si la información no está en la documentación, dilo claramente
4. Usa formato Markdown para estructurar tus respuestas
5. Cita secciones relevantes cuando sea apropiado

DOCUMENTACIÓN:
${documentContent || "No hay documentación disponible para esta consulta."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // Call OpenRouter API
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key no configurada" },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "TalkRev Docs",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter error:", errorData);
      return NextResponse.json(
        { error: "Error al procesar la solicitud" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

    return NextResponse.json({
      response: assistantMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
