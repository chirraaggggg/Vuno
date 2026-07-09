"use server"

import { getAuthServer } from "@/lib/supabase-server"
import { UIMessage, generateText } from "ai"
import { google } from "@/lib/ai-client"

export const generateProjectTitle = async (message: string) => {
  try {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: `
    You are an AI assistant that generates very short project names based on the user's prompt.
    - Keep it under 5 words.
    - Capitalize words appropriately.
    - Do not include special characters.
    - Return ONLY the name, nothing else.`,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    })
    const text = result.text;
    return text.trim() || "Untitled Project"
  } catch (error) {
    console.log(error, "Project title error")
    return "Untitled Project"
  }
}


export const convertModelMessages = async (messages: UIMessage[]) => {
  const modelMessages = messages.map((message: UIMessage) => {
    const contentParts: any[] = [];

    for (const part of message.parts) {
      if (part.type === "text" && typeof part.text === "string"
        && part.text.trim()
      ) {
        contentParts.push({
          type: "text",
          text: part.text
        })
      } else if (part.type === "file") {
        if (part.mediaType?.startsWith('image/') && part.url) {
          contentParts.push({
            type: "image",
            image: part.url
          })
        }
      }
    }

    const content = contentParts.length === 1 && contentParts?.[0].type === "text" ? contentParts[0].text : contentParts;

    return {
      role: message.role,
      content
    }
  })

  return modelMessages
}

export const deletePageAction = async (slugId: string, pageId: string) => {
  try {
    const { user, supabase } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const { data: project } = await supabase.from("projects")
      .select("id")
      .eq("slugId", slugId)
      .single();
    if (!project) return { error: "Project not found" }

    await supabase.from("pages")
      .delete()
      .eq("projectId", project.id)
      .eq("id", pageId)

    return { success: true }
  } catch (error) {
    return { error: "Internal server error" }
  }
}
