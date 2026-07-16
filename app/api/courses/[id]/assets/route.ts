import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../../lib/auth";
import { ensurePlanAccess, incrementUsage } from "../../../../../lib/billing";
import { generateLearningAsset, listLearningAssets, generateAssistantReply, learningAssetTypes } from "../../../../../lib/learning-suite";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await params;
    const assets = await listLearningAssets(id, user.id);
    return NextResponse.json({ assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await params;
    const body = await request.json();

    if (body?.action === "generate") {
      await ensurePlanAccess(user.id, { requireAi: true });
      const asset = await generateLearningAsset({
        courseId: id,
        userId: user.id,
        lessonId: body.lessonId ?? null,
        type: body.type,
        prompt: body.prompt,
        mode: body.mode ?? "generate"
      });
      return NextResponse.json({ asset });
    }

    if (body?.action === "assistant") {
      await ensurePlanAccess(user.id, { requireAi: true });
      const reply = await generateAssistantReply({
        courseId: id,
        userId: user.id,
        lessonId: body.lessonId ?? null,
        message: body.message
      });
      await incrementUsage(user.id, "AI_REQUEST");
      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: "Unsupported action", types: learningAssetTypes }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Asset action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
