import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "all";

    const where: any = {};
    if (search) {
      where.OR = [{ email: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }];
    }
    if (role !== "all") {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { courses: true } }
      },
      take: 50
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        coursesCount: u._count.courses
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users";
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message.includes("Admin") ? 403 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const id = body?.id as string | undefined;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (body?.action === "suspend") {
      await prisma.user.update({ where: { id }, data: { suspended: true } });
      await logAdminAction(admin.id, "suspend_user", "USER_MANAGEMENT", { targetId: id, details: `Suspended user ${id}` });
      return NextResponse.json({ success: true });
    }

    if (body?.action === "reactivate") {
      await prisma.user.update({ where: { id }, data: { suspended: false } });
      await logAdminAction(admin.id, "reactivate_user", "USER_MANAGEMENT", { targetId: id, details: `Reactivated user ${id}` });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message.includes("Admin") ? 403 : 500 });
  }
}
