import { ensurePrismaUser, AuthError } from "./auth";
import { prisma } from "./prisma";

export class AdminError extends Error {
  constructor(message = "Admin access required") {
    super(message);
    this.name = "AdminError";
  }
}

export async function requireAdmin() {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") {
    throw new AdminError("You do not have permission to access this resource.");
  }
  return user;
}

export async function logAdminAction(
  adminId: string,
  action: string,
  category: string,
  details?: { target?: string; targetId?: string; details?: string; ipAddress?: string; userAgent?: string }
) {
  return prisma.adminLog.create({
    data: {
      adminId,
      action,
      category,
      target: details?.target,
      targetId: details?.targetId,
      details: details?.details,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent
    }
  });
}

export async function getSystemSettings() {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }
  return settings;
}

export async function updateSystemSettings(data: Partial<any>) {
  const settings = await getSystemSettings();
  return prisma.systemSettings.update({ where: { id: settings.id }, data });
}

export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { name: flagName } });
  return flag?.enabled ?? false;
}

export async function getAdminDashboardStats() {
  const [totalUsers, activeUsers, newUsersThisMonth, premiumUsers, totalCourses, totalAiRequests, activeSubscriptions, cancelledSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.user.count({ where: { subscription: { isNot: null } } }),
    prisma.course.count({ where: { deletedAt: null } }),
    prisma.aIRequest.count({ where: { status: "COMPLETED" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "CANCELED" } })
  ]);

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "paid" }
  });

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers,
    totalCourses,
    totalAiRequests,
    monthlyRevenue: (totalRevenue._sum.amount ?? 0) / 100,
    activeSubscriptions,
    cancelledSubscriptions
  };
}

function getMonthBuckets(monthCount: number) {
  const now = new Date();
  const buckets: { label: string; start: Date; end: Date }[] = [];
  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    buckets.push({ label: start.toLocaleString("default", { month: "short" }), start, end });
  }
  return buckets;
}

export async function getAdminDashboardTrends() {
  const buckets = getMonthBuckets(6);
  const [userGrowth, revenue, aiUsage, courseCreation, subscriptionGrowth] = await Promise.all([
    Promise.all(buckets.map((bucket) => prisma.user.count({ where: { createdAt: { gte: bucket.start, lt: bucket.end } } }))),
    Promise.all(buckets.map((bucket) =>
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "paid", createdAt: { gte: bucket.start, lt: bucket.end } }
      }).then((result) => (result._sum.amount ?? 0) / 100)
    )),
    Promise.all(buckets.map((bucket) => prisma.aIRequest.count({ where: { createdAt: { gte: bucket.start, lt: bucket.end } } }))),
    Promise.all(buckets.map((bucket) => prisma.course.count({ where: { createdAt: { gte: bucket.start, lt: bucket.end }, deletedAt: null } }))),
    Promise.all(buckets.map((bucket) => prisma.subscription.count({ where: { createdAt: { gte: bucket.start, lt: bucket.end } } })))
  ]);

  return { labels: buckets.map((bucket) => bucket.label), userGrowth, revenue, aiUsage, courseCreation, subscriptionGrowth };
}

export async function getAdminUsers(params?: { search?: string; role?: string; status?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = {};

  if (params?.search) {
    where.OR = [
      { email: { contains: params.search, mode: "insensitive" } },
      { name: { contains: params.search, mode: "insensitive" } }
    ];
  }

  if (params?.role && params.role !== "all") {
    where.role = params.role.toUpperCase();
  }

  // status filters for suspended users are not supported by current schema

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
        createdAt: true,
        updatedAt: true,
        courses: { select: { id: true } },
        subscription: { select: { priceId: true, status: true } }
      }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total, page, perPage };
}

export async function getAdminCourses(params?: { search?: string; status?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = { deletedAt: null };

  if (params?.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { topic: { contains: params.search, mode: "insensitive" } }
    ];
  }

  if (params?.status && params.status !== "all") {
    if (params.status === "archived") {
      delete where.deletedAt;
      Object.assign(where, { archivedAt: { not: null } });
    } else {
      where.status = params.status.toUpperCase();
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.course.count({ where })
  ]);

  return { courses, total, page, perPage };
}

export async function getAdminUsageData() {
  const promptUsage = await prisma.aIRequest.groupBy({
    by: ["action"],
    _count: { _all: true },
    orderBy: { _count: { action: "desc" } },
    take: 20
  });

  const failedGenerations = await prisma.aIRequest.count({ where: { status: "FAILED" } });
  const totalTokens = await prisma.aIRequest.aggregate({ _sum: { tokens: true } });
  const usageByUser = await prisma.usage.findMany({
    orderBy: { count: "desc" },
    take: 20
  });

  return {
    usageByUser,
    totalTokens: totalTokens._sum.tokens ?? 0,
    failedGenerations,
    promptUsage
  };
}

export async function getAdminLogs(params?: { category?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = {};
  if (params?.category && params.category !== "all") {
    where.category = params.category;
  }

  try {
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage
      }),
      prisma.adminLog.count({ where })
    ]);

    return { logs, total, page, perPage };
  } catch (err) {
    return { logs: [], total: 0, page, perPage };
  }
}

export async function getAdminPayments(params?: { search?: string; status?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = {};

  if (params?.search) {
    where.OR = [
      { stripePaymentId: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
      { user: { name: { contains: params.search, mode: "insensitive" } } }
    ];
  }

  if (params?.status && params.status !== "all") {
    where.status = params.status.toUpperCase();
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.payment.count({ where })
  ]);

  return { payments, total, page, perPage };
}

export async function getAdminSubscriptions(params?: { search?: string; status?: string; plan?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = {};

  if (params?.search) {
    where.OR = [
      { stripeId: { contains: params.search, mode: "insensitive" } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
      { user: { name: { contains: params.search, mode: "insensitive" } } }
    ];
  }

  if (params?.status && params.status !== "all") {
    where.status = params.status.toUpperCase();
  }

  // plan filtering not supported by current DB schema

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.subscription.count({ where })
  ]);

  return { subscriptions, total, page, perPage };
}

export async function getAdminPromptTemplates(params?: { search?: string; status?: string }) {
  const where: any = {};
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { prompt: { contains: params.search, mode: "insensitive" } }
    ];
  }

  if (params?.status === "enabled") {
    where.deletedAt = null;
  }

  if (params?.status === "disabled") {
    where.deletedAt = { not: null };
  }

  return prisma.promptTemplate.findMany({ where, orderBy: { updatedAt: "desc" }, take: 100 });
}

export async function getFeatureFlags() {
  return prisma.featureFlag.findMany({ orderBy: { name: "asc" } });
}

export async function getFeedbackList(params?: { status?: string; page?: number; perPage?: number }) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const where: any = {};

  if (params?.status && params.status !== "all") {
    where.status = params.status;
  }

  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.feedback.count({ where })
  ]);

  return { feedback, total, page, perPage };
}

export async function suspendUser(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { suspended: true } });
}

export async function reactivateUser(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { suspended: false } });
}

export async function promoteAdmin(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
}

export async function demoteAdmin(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { role: "USER" } });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}

export async function resetUserUsage(userId: string) {
  return prisma.usage.deleteMany({ where: { userId } });
}

export async function archiveCourse(courseId: string) {
  return prisma.course.update({ where: { id: courseId }, data: { archivedAt: new Date() } });
}

export async function restoreCourse(courseId: string) {
  return prisma.course.update({ where: { id: courseId }, data: { archivedAt: null } });
}

export async function deleteCourse(courseId: string) {
  return prisma.course.update({ where: { id: courseId }, data: { deletedAt: new Date() } });
}

export async function duplicateCourse(courseId: string, adminId: string) {
  const original = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true } }, certificate: true }
  });
  if (!original) return null;

  const copy = await prisma.course.create({
    data: {
      userId: original.userId,
      title: `${original.title} (Copy)`,
      description: original.description,
      topic: original.topic,
      audience: original.audience,
      difficulty: original.difficulty,
      language: original.language,
      tone: original.tone,
      lessonCount: original.lessonCount,
      duration: original.duration,
      status: "DRAFT",
      coverImageUrl: original.coverImageUrl,
      modules: {
        create: original.modules.map((module) => ({
          title: module.title,
          position: module.position,
          lessons: {
            create: module.lessons.map((lesson) => ({
              title: lesson.title,
              content: lesson.content,
              examples: lesson.examples,
              exercises: lesson.exercises
            }))
          }
        }))
      },
      certificate: original.certificate
        ? {
            create: {
              content: original.certificate.content
            }
          }
        : undefined
    }
  });

  await logAdminAction(adminId, "duplicate_course", "COURSE_MANAGEMENT", { targetId: courseId, details: `Duplicated course ${courseId} to ${copy.id}` });
  return copy;
}

export async function retryFailedAiRequest(requestId: string) {
  const aiRequest = await prisma.aIRequest.findUnique({ where: { id: requestId } });
  if (!aiRequest) return null;
  if (aiRequest.status !== "FAILED") return aiRequest;

  const { complete } = await import("./ai");
  const response = await complete(aiRequest.prompt);

  return prisma.aIRequest.update({
    where: { id: requestId },
    data: { response, status: "COMPLETED" }
  });
}

export async function enablePromptTemplate(id: string) {
  return prisma.promptTemplate.update({ where: { id }, data: { deletedAt: null } });
}

export async function disablePromptTemplate(id: string) {
  return prisma.promptTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function duplicatePromptTemplate(id: string) {
  const original = await prisma.promptTemplate.findUnique({ where: { id } });
  if (!original) return null;
  return prisma.promptTemplate.create({
    data: {
      userId: original.userId,
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      prompt: original.prompt,
      deletedAt: original.deletedAt
    }
  });
}

export async function rollbackPromptTemplate(id: string, targetId: string) {
  const target = await prisma.promptTemplate.findUnique({ where: { id: targetId } });
  if (!target) return null;
  return prisma.promptTemplate.update({ where: { id }, data: { prompt: target.prompt, description: target.description } });
}

export async function updateFeedback(id: string, data: { status?: string; response?: string; resolved?: boolean }) {
  return prisma.feedback.update({ where: { id }, data });
}

export async function archiveFeedback(id: string) {
  return prisma.feedback.update({ where: { id }, data: { status: "archived" } });
}


