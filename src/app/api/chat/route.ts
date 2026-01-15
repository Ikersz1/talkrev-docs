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
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Fetch relevant documentation content
    const supabase = await createServerSupabaseClient();
    let documentContent = "";

    if (context === "all") {
      // Fetch all documents with content
      const { data: docs } = await supabase
        .from("documents")
        .select("title, content")
        .eq("is_published", true)
        .not("content", "is", null)
        .order("updated_at", { ascending: false });

      if (docs && docs.length > 0) {
        // Limit to most recent 50 documents to avoid token limits
        const recentDocs = docs.slice(0, 50);
        documentContent = recentDocs
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
          // It's a folder - get all docs in it and subfolders recursively
          const allDocs: { title: string; content: string }[] = [];
          
          // Recursive function to get all documents in a folder and its subfolders
          async function getFolderDocs(folderId: string) {
            // Get documents directly in this folder
            const { data: docs } = await supabase
              .from("documents")
              .select("title, content")
              .eq("folder_id", folderId)
              .eq("is_published", true)
              .not("content", "is", null);
            
            if (docs) {
              allDocs.push(...docs);
            }
            
            // Get subfolders
            const { data: subfolders } = await supabase
              .from("folders")
              .select("id")
              .eq("parent_id", folderId);
            
            // Recursively get docs from subfolders
            if (subfolders) {
              for (const subfolder of subfolders) {
                await getFolderDocs(subfolder.id);
              }
            }
          }
          
          await getFolderDocs(folder.id);
          
          if (allDocs.length > 0) {
            documentContent = allDocs
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
    const systemPrompt = `You are an expert technical documentation assistant. Your job is to answer questions based ONLY on the documentation provided below.

RULES:
1. Always respond in English
2. Be concise and direct
3. If the information is not in the documentation, say so clearly
4. Use Markdown format to structure your responses
5. Cite relevant sections when appropriate

DOCUMENTATION:
${documentContent || "No documentation available for this query."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // Call OpenRouter API
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
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
        { error: "Error processing request" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return NextResponse.json({
      response: assistantMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
        { error: "Internal server error" },
      { status: 500 }
    );
  }
}
