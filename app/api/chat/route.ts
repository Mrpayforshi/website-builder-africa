import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { AI_TOOLS, type AiToolName } from "@/lib/ai/tools";
import { executeTool } from "@/lib/ai/tool-executor";
import { buildIntakeSystemPrompt, buildEditSystemPrompt } from "@/lib/ai/system-prompt";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  const { businessId, messages, mode } = await req.json();

  if (!businessId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "businessId and messages are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Load-bearing: apply_site_config_patch is SECURITY DEFINER and bypasses
  // RLS. Membership must be verified before any tool call can reach it.
  const membership = await checkBusinessMembership(user.id, businessId);
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this business" }, { status: 403 });
  }

  const { data: business } = await supabase.from("businesses").select("*").eq("id", businessId).single();
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const config = await getSiteConfig(businessId);
  const systemPrompt =
    mode === "edit" && config ? buildEditSystemPrompt(business, config) : buildIntakeSystemPrompt(business);

  const conversation = [...messages];
  let finalTextResponse = "";
  const toolResultsLog: Record<string, unknown>[] = [];

  // Basic agent loop: call the model, execute tool calls, feed results back,
  // repeat until the model replies with text and no further tool use.
  for (let turn = 0; turn < 5; turn++) {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversation,
        tools: AI_TOOLS,
      }),
    });

    const data = await response.json();
    const toolUseBlocks = (data.content ?? []).filter((b: { type: string }) => b.type === "tool_use");
    const textBlocks = (data.content ?? []).filter((b: { type: string }) => b.type === "text");

    finalTextResponse = textBlocks.map((b: { text: string }) => b.text).join("\n");

    if (toolUseBlocks.length === 0) break;

    conversation.push({ role: "assistant", content: data.content });

    const toolResults = [];
    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name as AiToolName, block.input, { businessId, userId: user.id });
      toolResultsLog.push({ tool: block.name, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
        is_error: !result.ok,
      });
    }

    conversation.push({ role: "user", content: toolResults });
  }

  return NextResponse.json({ reply: finalTextResponse, toolCalls: toolResultsLog });
}
