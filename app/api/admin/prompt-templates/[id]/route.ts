import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, enablePromptTemplate, disablePromptTemplate, duplicatePromptTemplate } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const template = await prisma.promptTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        type: body.type,
        prompt: body.prompt
      }
    });

    await logAdminAction(admin.id, "update_prompt_template", "PROMPT_TEMPLATES", {
      targetId: id,
      details: `Updated template: ${template.name}`
    });

    return NextResponse.json({ template });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    await prisma.promptTemplate.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_prompt_template", "PROMPT_TEMPLATES", {
      targetId: id,
      details: `Deleted template ${id}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body?.action === "enable") {
      const t = await enablePromptTemplate(id);
      await logAdminAction(admin.id, "enable_prompt_template", "PROMPT_TEMPLATES", { targetId: id });
      return NextResponse.json({ template: t });
    }

    if (body?.action === "disable") {
      const t = await disablePromptTemplate(id);
      await logAdminAction(admin.id, "disable_prompt_template", "PROMPT_TEMPLATES", { targetId: id });
      return NextResponse.json({ template: t });
    }

    if (body?.action === "duplicate") {
      const t = await duplicatePromptTemplate(id);
      await logAdminAction(admin.id, "duplicate_prompt_template", "PROMPT_TEMPLATES", { targetId: id });
      return NextResponse.json({ template: t });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
