import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, getAdminPromptTemplates } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const templates = await getAdminPromptTemplates({ search, status });
    return NextResponse.json({ templates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const template = await prisma.promptTemplate.create({
      data: {
        userId: admin.id,
        name: body.name,
        description: body.description ?? null,
        type: body.type,
        prompt: body.prompt
      }
    });

    await logAdminAction(admin.id, "create_prompt_template", "PROMPT_TEMPLATES", {
      targetId: template.id,
      details: `Created template: ${template.name}`
    });

    return NextResponse.json({ template });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
