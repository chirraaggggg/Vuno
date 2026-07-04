import { getAuthServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;
    const { user, supabase } = await getAuthServer()
    if (!user) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 })

    const { data: project, error } = await supabase.from("projects")
      .select("id, title")
      .eq("slugId", slugId)
      .single()

    if (!project || error) {
      return NextResponse.json({
        title: 'Untitled Project',
        messages: [],
        pages: []
      }, { status: 200 })
    }

    const { data: messages } = await supabase.from("messages")
      .select("*")
      .eq("projectId", project.id)
      .order("createdAt", { ascending: true })

    const { data: pages } = await supabase.from("pages")
      .select("*")
      .eq("projectId", project.id)
      .order("createdAt", { ascending: true })

    const mappedMessages = (messages || []).map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts,
      createdAt: message.createdAt
    }))

    return NextResponse.json({
      title: project.title,
      messages: mappedMessages,
      pages: pages
    })


  } catch (error) {
    console.log(error);
    return NextResponse.json({
      error: "Internal Server error",
    }, { status: 500 })
  }
}
