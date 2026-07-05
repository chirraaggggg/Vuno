import { NextRequest, NextResponse } from "next/server";
import { convertModelMessages, generateProjectTitle } from "@/app/action/action";
import { getAuthServer } from "@/lib/supabase-server";
import { createUIMessageStream, createUIMessageStreamResponse, generateId, UIMessage, generateText, streamText } from "ai";
import { groq } from "@/lib/ai-client";
import { VUNO_CHAT_PROMPT, VUNO_INTENT_PROMPT, WEB_ANALYSIS_PROMPT, WEB_GENERATION_PROMPT } from "@/lib/prompt";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

class AbortError extends Error {
  constructor() {
    super('Request aborted');
    this.name = 'AbortError';
  }
}

export async function GET() {
  try {
    const { user, supabase } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: projects, error } = await supabase.from("projects")
      .select("id, title, slugId, createdAt")
      .order("createdAt", { ascending: false })
      .limit(10);

    if (error) NextResponse.json({ error: "Failed to fetch projects" }, { status: 400 });

    return NextResponse.json(projects)
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}

const emit = (
  writer: any,
  type: string,
  data: object = {},
  options?: {
    id?: string;
    transient?: boolean
  }
) => {
  writer.write({
    id: options?.id,
    type: `data-${type}`,
    data,
    transient: options?.transient
  })
}

async function runGenerationWorker({
  supabase,
  supabaseAdmin,
  writer,
  projectId,
  analysis,
  existingPages,
  latestUserMessage,
  checkAbort,
}: any) {
  const { pages } = analysis;
  console.log(pages?.length, pages, "pages")

  if (!analysis || !pages || pages?.length === 0) {
    throw new Error("No pages generated");
  }

  emit(writer, "generation", {
    status: "generating",
    pages: pages.map((page: any) => ({
      id: page.id,
      name: page.name,
      done: false
    }))
  }, { id: "gen-card" })

  emit(writer, "pages-skeleton", {
    pages: pages.map((page: any) => ({
      id: page.id,
      name: page.name,
      rootStyles: page.rootStyles,
      htmlContent: "",
      isLoading: true
    }))
  }, { transient: true });

  const generationPages: { name: string; htmlContent: string }[] = [] = [
    ...(existingPages?.map((page: any) => (
      { name: page.name, htmlContent: page.htmlContent }
    ))) || []
  ]

  for (const page of pages) {
    checkAbort()

    emit(writer, "generation", {
      status: "generating",
      currentPageId: page.id,
      pages: pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        done: generationPages.some((gp: any) => gp.name === page.name)
      }))
    }, { id: "gen-card" })

    const previousPagesContext = generationPages.length > 0
      ? generationPages.slice(-2).map((p) => `<!--${p.name}-->\n${p.htmlContent}`).join('\n\n')
      : "No previous pages";

    const generateOptions: any = {
      model: groq('llama-3.3-70b-versatile'),
      maxTokens: 1500,
      messages: [
        {
          role: "system",
          content: WEB_GENERATION_PROMPT,
        },
        {
          role: 'user',
          content: `
 GENERATE HTML FOR THE FOLLOWING PAGE:
- Page Name: ${page.name}
- Page Purpose: ${page.purpose}
- Visual Description: ${page.visualDescription}
- Theme Variables for this page (already injected in :root — reference via var(), do NOT redeclare):
${page.rootStyles}
- Context from previous pages : ${previousPagesContext}

    CRITICAL REQUIREMENTS:
    1. STYLE PRIORITY: Follow the "Visual Description" above as the ultimate source of truth.
    2. OUTPUT FORMAT: Generate ONLY raw HTML markup. Start exactly with <div. Do not include \`\`\`html or any markdown wrappers.
    CRITICAL:
        1. Generate ONLY raw HTML markup production-ready responsive web page using Tailwind CSS for layout spacing, typography, shadows, etc.
        2. **All content must be inside a single root <div> that controls the layout.**
            - No overflow classes on the root.
            - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        3. ***Important*** For absolute overlays (maps, modals, etc.):**
            - Use \`relative w-full h-screen\` on the top div of the overlay.
        4. ***Important*** For regular content:**
            - Use \`w-full h-full min-h-screen\` on the top div.
        5. ***Important*** Do not use h-screen on inner content unless absolutely required.**
            - Height must grow with content; content must be fully visible inside an iframe.
        6. **For z-index layering:**
            - Ensure absolute elements do not block other content unnecessarily.
        7. **Output raw HTML only, starting with <div>.**
            - Do not include markdown, comments, <html>, <body>, or <head>.
        8. **Hardcode a style only if a theme variable is not needed for that element.**
        9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        Generate the complete, production-ready HTML for "${page.name}" now:`.trim(),
        }
      ]
    };

    let result;
    try {
      result = await generateText(generateOptions);
    } catch (error: any) {
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        console.log('Rate limit hit, waiting 10s...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        result = await generateText(generateOptions);
      } else {
        throw error;
      }
    }

    let htmlContent = result.text ?? ""
    const match = htmlContent.match(/<div[\s\S]*<\/div>/);
    htmlContent = match ? match[0] : htmlContent;
    htmlContent = htmlContent.replace(/```/g, "")

    let savedPage: any = { id: generateId(), name: page.name, rootStyles: page.rootStyles, htmlContent };
    try {
      const { data, error } = await supabaseAdmin.from("pages").insert([
        {
          projectId,
          name: page.name,
          rootStyles: page.rootStyles,
          htmlContent
        }
      ]).select().single();

      if (error) {
        console.error("Supabase insert error (runGenerationWorker pages):", error);
      } else if (data) {
        savedPage = data;
      }
    } catch (err) {
      console.error("Exception during Supabase insert (runGenerationWorker pages):", err);
    }

    generationPages.push({
      name: page.name,
      htmlContent: htmlContent
    })

    emit(writer, "generation", {
      status: "generating",
      currentPageId: page.id,
      pages: pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        done: generationPages.some((gp: any) => gp.name === page.name)
      }))
    }, { id: "gen-card" })

    emit(writer, "page-created", {
      tempId: page.id,
      page: {
        id: savedPage.id,
        name: savedPage.name,
        rootStyles: savedPage.rootStyles,
        htmlContent: savedPage.htmlContent,
        isLoading: false
      }
    }, { transient: true });
  }

  emit(writer, "generation", {
    status: "complete",
    pages: pages.map((p: any) => ({
      id: p.id,
      name: p.name,
      done: true
    }))
  }, { id: "gen-card" })

  const summaryResult = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: [
      {
        role: "system",
        content: `You are Vuno, an AI web design agent. You just finished building pages.
Write 1-2 sentences in first person. Natural, confident. No questions. No "let me know".`
      },
      {
        role: 'user',
        content: `Designed: ${pages.map((p: any) => p.name).join(', ')} for: "${latestUserMessage}". Summarize briefly.`
      }
    ]
  })

  const summaryId = generateId();
  let fullSummaryText = "";

  writer.write({ type: "text-start", id: summaryId })
  for await (const delta of summaryResult.textStream) {
    fullSummaryText += delta
    if (delta) {
      writer.write({ type: "text-delta", id: summaryId, delta: delta })
    }
  }
  writer.write({ type: "text-end", id: summaryId });

  checkAbort()
  try {
    const { error } = await supabaseAdmin.from("messages").insert([
      {
        projectId,
        role: "assistant",
        parts: [
          {
            type: "data-generation",
            id: "gen-card",
            data: {
              status: "complete",
              pages: pages.map((p: any) => ({
                id: p.id,
                name: p.name,
                done: true
              }))
            }
          },
          { type: "text", text: fullSummaryText }
        ]
      }
    ]);
    if (error) {
      console.error("Supabase insert error (runGenerationWorker messages):", error);
    }
  } catch (err) {
    console.error("Exception during Supabase insert (runGenerationWorker messages):", err);
  }
}

async function runRegenerateWorker({
  supabase,
  supabaseAdmin,
  writer,
  projectId,
  selectedPage,
  latestUserMessage,
  analysis,
  checkAbort,
}: any) {
  if (!selectedPage) {
    writer.write({
      type: "error",
      errorText: "No Page was selected "
    })
    return
  }

  if (!analysis || analysis?.pages?.length === 0) {
    throw new Error("No pages generated");
  }

  emit(writer, "page-loading", {
    pageId: selectedPage.id,
    isLoading: true
  }, { transient: true })

  emit(writer, "generation", {
    status: "regenerating",
    regeneratePage: {
      id: selectedPage.id,
      name: selectedPage.name,
      done: false
    }
  }, { id: "gen-card" })

  const generateOptions: any = {
    model: groq('llama-3.3-70b-versatile'),
    maxTokens: 1500,
    messages: [
      {
        role: "system",
        content: WEB_GENERATION_PROMPT,
      },
      {
        role: "user",
        content: `
                You are surgically editing an existing page.
                RULE: Return the COMPLETE page HTML with ONLY the requested change applied. Every other section, component, and element must remain exactly as it is in the Current HTML.

                EDITING: "${selectedPage.name}"
                USER REQUEST: "${latestUserMessage}"
                CHANGE ONLY: ${analysis.pages[0].visualDescription}
                Current HTML: ${selectedPage.htmlContent}
                Return the full page HTML with only the requested change. Start with <div.`.trim()
      }
    ]
  };

  let result;
  try {
    result = await generateText(generateOptions);
  } catch (error: any) {
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      console.log('Rate limit hit, waiting 10s...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      result = await generateText(generateOptions);
    } else {
      throw error;
    }
  }

  let htmlContent = result.text ?? '';
  const match = htmlContent.match(/<div[\s\S]*<\/div>/);
  htmlContent = match ? match[0] : htmlContent;
  htmlContent = htmlContent.replace(/```/g, '');

  let updatedPage: any = { id: selectedPage.id, name: selectedPage.name, rootStyles: analysis.rootStyles, htmlContent };
  try {
    const { data, error } = await supabaseAdmin.from("pages")
      .update({ htmlContent, rootStyles: analysis.rootStyles })
      .eq("id", selectedPage.id).select().single()

    if (error) {
      console.error("Supabase update error (runRegenerateWorker pages):", error);
    } else if (data) {
      updatedPage = data;
    }
  } catch (err) {
    console.error("Exception during Supabase update (runRegenerateWorker pages):", err);
  }

  emit(writer, "page-created", {
    page: {
      id: updatedPage.id,
      name: updatedPage.name,
      rootStyles: updatedPage.rootStyles,
      htmlContent: updatedPage.htmlContent,
      isLoading: false,
    }
  }, { transient: true })

  emit(writer, "generation", {
    status: "complete",
    regeneratePage: {
      id: updatedPage.id,
      name: updatedPage.name,
      done: true
    }
  }, { id: "gen-card" })

  const summaryResult = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: [
      {
        role: "system",
        content: `You are Vuno, an AI web design agent. You just finished building pages.
Write 1-2 sentences in first person. Natural, confident. No questions. No "let me know".`
      },
      {
        role: 'user',
        content: `Updated: ${updatedPage.name} for: "${latestUserMessage}". Summarize briefly.`
      }
    ]
  })

  const summaryId = generateId();
  let fullSummaryText = "";

  writer.write({ type: "text-start", id: summaryId })
  for await (const delta of summaryResult.textStream) {
    fullSummaryText += delta
    if (delta) {
      writer.write({ type: "text-delta", id: summaryId, delta: delta })
    }
  }
  writer.write({ type: "text-end", id: summaryId });

  checkAbort()
  try {
    const { error } = await supabaseAdmin.from("messages").insert([
      {
        projectId,
        role: "assistant",
        parts: [
          {
            type: "data-generation",
            id: "gen-card",
            data: {
              status: "complete",
              regeneratePage: {
                id: updatedPage.id,
                name: updatedPage.name,
                done: true
              }
            }
          },
          { type: "text", text: fullSummaryText }
        ]
      }
    ]);
    if (error) {
      console.error("Supabase insert error (runRegenerateWorker messages):", error);
    }
  } catch (err) {
    console.error("Exception during Supabase insert (runRegenerateWorker messages):", err);
  }
}

export async function POST(request: NextRequest) {
  const { signal } = request;
  try {
    const { messages, slugId, selectedPageId } = await request.json() as {
      messages: UIMessage[];
      slugId: string;
      selectedPageId: string;
    }

    const { user, supabase } = await getAuthServer()
    
    console.log('Auth check starting...')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    console.log('User:', authUser?.id, 'Auth error:', authError)

    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("slugId", slugId)
      .single();

    if (!project) {
      console.log("creating new project");
      const lastMessage = messages[messages.length - 1];
      const messageText = lastMessage?.parts.find((part) =>
        part.type === "text"
      )?.text as string
      const title = await generateProjectTitle(messageText);
      try {
        const { data: newProject, error } = await supabaseAdmin
          .from("projects")
          .insert([{ slugId, title, userId: user.id }])
          .select()
          .single()

        if (error) {
          console.error("Supabase insert error (POST project):", error);
          throw error;
        }
        if (!newProject) throw new Error("Failed to create project");
        project = newProject
      } catch (err) {
        console.error("Exception during Supabase insert (POST project):", err);
        throw err;
      }
    }

    const projectId = project!.id;

    const { data: existingPages } = await supabase.from("pages")
      .select("id, name, rootStyles, htmlContent")
      .eq("projectId", projectId)
      .order("createdAt", { ascending: true })
      .limit(2)

    const hasExistingPages = existingPages && existingPages.length

    const lastMessage = messages[messages.length - 1];
    try {
      const { error: msgError } = await supabaseAdmin.from("messages").insert([{
        projectId,
        role: "user",
        parts: lastMessage.parts
      }]);
      if (msgError) console.error("Supabase insert error (POST messages - user):", msgError);
    } catch (err) {
      console.error("Exception during Supabase insert (POST messages - user):", err);
    }

    const modelMessages = await convertModelMessages(messages.slice(10))
    const latestUserMessage = (lastMessage.parts?.find((p: any) => p.type === 'text') as any)?.text;
    const imageParts = lastMessage.parts.filter((part) => part.type === "file" && part.mediaType.startsWith("image/"))
      .map((p: any) => ({ type: "image" as const, image: p.url }))

    const { data: selectedPage } = selectedPageId ? await supabase.from("pages")
      .select("id, name, rootStyles, htmlContent")
      .eq("id", selectedPageId)
      .single()
      : { data: null }

    const checkAbort = () => {
      if (signal.aborted) throw new AbortError()
    }

    const uiStream = createUIMessageStream({
      generateId: generateId,
      async execute({ writer }) {
        let genCardEmitted = false;
        try {
          if (project?.title) {
            emit(writer, "project-title", {
              title: project.title
            }, { id: "proj-title", transient: true })

            checkAbort();

            let result;
            try {
              result = await generateText({
                model: groq('llama-3.3-70b-versatile'),
                messages: [
                  { role: "system", content: VUNO_INTENT_PROMPT },
                  { role: "user", content: `${latestUserMessage}\nCLASSIFY THE INTENT NOW. ONE WORD ONLY` }
                ]
              });
            } catch (error: any) {
              if (error?.message?.includes('quota') || error?.message?.includes('429')) {
                console.log('Rate limit hit, waiting 10s...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                result = await generateText({
                  model: groq('llama-3.3-70b-versatile'),
                  messages: [
                    { role: "system", content: VUNO_INTENT_PROMPT },
                    { role: "user", content: `${latestUserMessage}\nCLASSIFY THE INTENT NOW. ONE WORD ONLY` }
                  ]
                });
              } else if (error?.message?.includes('model output must contain') || error?.message?.includes('empty')) {
                // Groq returned empty — default to generate
                result = { text: 'generate' } as any;
              } else {
                throw error;
              }
            }

            const classify_output = ((result?.text) || 'generate').trim().toLowerCase();
            const firstWord = classify_output.split(' ')[0];
            const validIntents = ["chat", "generate", "regenerate"];
            const intent = validIntents.includes(firstWord) ? firstWord as any : 'generate'
            const classification = { intent }

            // Chat handler
            if (classification.intent === "chat") {
              const chatResult = await streamText({
                model: groq('llama-3.3-70b-versatile'),
                messages: [
                  { role: "system", content: VUNO_CHAT_PROMPT },
                  ...modelMessages
                ]
              })

              const chatId = generateId();
              let chatText = "";

              writer.write({ type: "text-start", id: chatId })
              for await (const delta of chatResult.textStream) {
                checkAbort();
                chatText += delta;
                if (delta) {
                  writer.write({ type: "text-delta", id: chatId, delta })
                }
              }
              writer.write({ type: "text-end", id: chatId })
              checkAbort();

              try {
                const { error: chatMsgError } = await supabaseAdmin.from("messages").insert([{
                  projectId,
                  role: "assistant",
                  parts: [{ type: "text", text: chatText }]
                }]);
                if (chatMsgError) console.error("Supabase insert error (POST messages - chat):", chatMsgError);
              } catch (err) {
                console.error("Exception during Supabase insert (POST messages - chat):", err);
              }

              return;
            }

            const isRegen = classification.intent === "regenerate" && !!selectedPage
            console.log(classification, "classification", isRegen)

            emit(writer, "generation", { status: "analyzing", page: [] }, { id: "gen-card" })
            genCardEmitted = true

            // Note: llama-3.3-70b-versatile is text-only — strip image parts
            const analysisOptions: any = {
              model: groq('llama-3.3-70b-versatile'),
              maxTokens: 1500,
              messages: [
                { role: "system", content: WEB_ANALYSIS_PROMPT },
                {
                  role: "user",
                  content: `${imageParts.length > 0
                    ? `[User attached an image as reference — imagine a visually rich, modern design matching their request]\n\n`
                    : ''}
${selectedPage && isRegen
                    ? `EDITING THIS PAGE:\n- Name: ${selectedPage.name}\n- Current Styles:\n${selectedPage.rootStyles}\n- Current HTML:\n${selectedPage.htmlContent}\nBe surgical apply only requested changes.\n\n`
                    : selectedPage && !isRegen
                      ? `STYLE REFERENCE (match this brand DNA):
                        - Name: ${selectedPage.name}
                        - Brand Colors & Fonts: See Styles below.
                        - Logo/Header Pattern: ${selectedPage.htmlContent.substring(0, 1500)}
                        - Styles:${selectedPage.rootStyles}\n\n` : ''}
${hasExistingPages && !isRegen
                    ? `EXISTING PAGES (do NOT recreate):\n${existingPages!.map((p: any) => `- ${p.name}\n${p.rootStyles}`).join('\n')}\n\n`
                    : ''}
USER REQUEST: "${latestUserMessage}" OUTPUT RAW JSON ONLY.`.trim()
                }
              ]
            };

            let analysisResult;
            try {
              analysisResult = await generateText(analysisOptions);
            } catch (error: any) {
              if (error?.message?.includes('quota') || error?.message?.includes('429')) {
                console.log('Rate limit hit, waiting 10s...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                analysisResult = await generateText(analysisOptions);
              } else if (error?.message?.includes('model output must contain') || error?.message?.includes('empty')) {
                console.log('Groq empty output on analysis, retrying...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                analysisResult = await generateText(analysisOptions);
              } else {
                throw error;
              }
            }

            checkAbort();

            let analysis: any;
            const analysisText = analysisResult.text || '{}'

            try {
              const jsonStart = analysisText.indexOf('{');
              const jsonEnd = analysisText.lastIndexOf('}');
              if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON object found");
              const cleanJson = analysisText.substring(jsonStart, jsonEnd + 1);
              analysis = JSON.parse(cleanJson)
            } catch (error) {
              console.log("Analysis error", error);
              throw new Error("Failed to parse json output");
            }

            if (isRegen && selectedPageId) {
              checkAbort();
              await runRegenerateWorker({
                supabase, supabaseAdmin, writer, projectId, selectedPage,
                latestUserMessage, analysis, checkAbort,
              })
              return
            }

            checkAbort();
            await runGenerationWorker({
              supabase, supabaseAdmin, writer, projectId, analysis,
              existingPages, latestUserMessage, checkAbort,
            });
          }
        } catch (error) {
          console.log(error)
          if (error instanceof AbortError) {
            if (genCardEmitted) {
              emit(writer, "generation", { status: "canceled" }, { id: "gen-card" })
              writer.write({ type: "abort" })
            }
            return
          }
          emit(writer, 'generation', { status: 'error' }, { id: 'gen-card' });
          writer.write({ type: "error", errorText: "Something went wrong" })
        }
      }
    })

    return createUIMessageStreamResponse({ stream: uiStream })

  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}