import { prisma } from "./prisma";
import Stripe from "stripe";
import { SubscriptionStatus, UsageType } from "@prisma/client";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" }) : null;

export const planConfig = {
  FREE: {
    name: "Free" as const,
    courseLimit: 3,
    aiLimit: 50,
    exportFormats: ["pdf", "markdown"],
    premiumTemplates: false,
    watermark: true,
    priceIds: {}
  },
  PRO: {
    name: "Pro" as const,
    courseLimit: Number.POSITIVE_INFINITY,
    aiLimit: Number.POSITIVE_INFINITY,
    exportFormats: ["pdf", "docx", "markdown", "html", "json", "csv", "pptx"],
    premiumTemplates: true,
    watermark: false,
    priceIds: {
      monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "price_monthly_placeholder",
      yearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "price_yearly_placeholder"
    }
  }
};

export type PlanKey = keyof typeof planConfig;

// Plans are derived from presence of a subscription in the current schema.

function toStatus(value: string): SubscriptionStatus {
  switch (value) {
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "cancelled":
      return "CANCELED";
    case "active":
    default:
      return "ACTIVE";
  }
}

export async function getOrCreateCustomer(userId: string, email: string) {
  if (!stripe) throw new Error("Stripe is not configured.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (subscription?.stripeId) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeId);
      if (stripeSub?.customer && typeof stripeSub.customer === "string") return stripeSub.customer as string;
    } catch {
      // ignore and create a customer
    }
  }

  const customer = await stripe.customers.create({ email, metadata: { userId } });
  return customer.id;
}

export async function createCheckoutSession(userId: string, plan: "monthly" | "yearly", successUrl: string, cancelUrl: string) {
  if (!stripe) throw new Error("Stripe is not configured.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const customerId = await getOrCreateCustomer(userId, user.email);
  const priceId = planConfig.PRO.priceIds[plan];

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId, plan: plan === "yearly" ? "yearly" : "monthly" }
    }
  });
}

export async function createBillingPortalSession(userId: string, returnUrl: string) {
  if (!stripe) throw new Error("Stripe is not configured.");
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  let customerId: string | null = null;

  if (subscription?.stripeId && stripe) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeId);
      if (stripeSub?.customer && typeof stripeSub.customer === "string") customerId = stripeSub.customer as string;
    } catch {
      // ignore
    }
  }

  if (!customerId) throw new Error("No Stripe customer found");

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
}

export async function syncSubscriptionFromStripe(userId: string, subscriptionId: string) {
  if (!stripe) throw new Error("Stripe is not configured.");

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = stripeSubscription.items.data[0]?.price.id ?? "";
  const interval = stripeSubscription.items.data[0]?.price.recurring?.interval === "year" ? "YEARLY" : "MONTHLY";

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeId: stripeSubscription.id,
      status: toStatus(stripeSubscription.status),
      priceId,
      interval,
      cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null
    },
    update: {
      stripeId: stripeSubscription.id,
      status: toStatus(stripeSubscription.status),
      priceId,
      interval,
      cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null
    }
  });

  return prisma.subscription.findUnique({ where: { userId } });
}

export async function getPlanSnapshot(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const plan = subscription ? "PRO" : "FREE";
  const status = subscription?.status ?? "CANCELED";
  const active = status === "ACTIVE" || status === "TRIALING";
  return {
    plan,
    active,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: Boolean(subscription?.cancelAt),
    status,
    features: planConfig[plan as PlanKey]
  };
}

export function getUsagePeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getUsageCount(userId: string, type: UsageType) {
  try {
    const result = await prisma.usage.aggregate({ where: { userId, type }, _sum: { count: true } });
    return result._sum.count ?? 0;
  } catch {
    const record = await prisma.usage.findFirst({ where: { userId, type } });
    return record?.count ?? 0;
  }
}

export async function incrementUsage(userId: string, type: UsageType, amount = 1) {
  const existing = await prisma.usage.findFirst({ where: { userId, type } });

  if (existing) {
    return prisma.usage.update({ where: { id: existing.id }, data: { count: existing.count + amount } });
  }

  return prisma.usage.create({ data: { userId, type, count: amount } });
}

export async function getPlanUsageSummary(userId: string) {
  const [aiCount, courseCount, exportCount, subscription] = await Promise.all([
    getUsageCount(userId, "AI_REQUEST"),
    getUsageCount(userId, "COURSE"),
    getUsageCount(userId, "EXPORT"),
    prisma.subscription.findUnique({ where: { userId } })
  ]);

  const plan = (subscription ? "PRO" : "FREE") as PlanKey;
  const limits = planConfig[plan];
  const planName = planConfig[plan].name;

  return {
    aiCount,
    courseCount,
    exportCount,
    plan,
    planName,
    limits,
    aiRemaining: limits.aiLimit === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : Math.max(limits.aiLimit - aiCount, 0),
    courseRemaining: limits.courseLimit === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : Math.max(limits.courseLimit - courseCount, 0),
    exportRemaining: limits.exportFormats.length === 0 ? 0 : Number.POSITIVE_INFINITY,
    storageRemaining: Number.POSITIVE_INFINITY
  };
}

export async function ensurePlanAccess(userId: string, options?: { requireAi?: boolean; requireCourse?: boolean; requireExport?: boolean }) {
  const snapshot = await getPlanSnapshot(userId);
  const usage = await getPlanUsageSummary(userId);

  if (options?.requireAi && usage.aiRemaining <= 0) {
    throw new Error(`AI generation limit reached for the ${snapshot.plan.toLowerCase()} plan.`);
  }

  if (options?.requireCourse && usage.courseRemaining <= 0) {
    throw new Error(`Course creation limit reached for the ${snapshot.plan.toLowerCase()} plan.`);
  }

  if (options?.requireExport && usage.exportRemaining <= 0) {
    throw new Error(`Export limit reached for the ${snapshot.plan.toLowerCase()} plan.`);
  }

  return { snapshot, usage };
}

export async function ensurePlanAccessForExport(userId: string, format: string) {
  const snapshot = await getPlanSnapshot(userId);
  const usage = await getPlanUsageSummary(userId);
  const allowed = planConfig[snapshot.plan as PlanKey].exportFormats.includes(format);
  if (!allowed) {
    throw new Error(`The ${snapshot.plan.toLowerCase()} plan does not include ${format.toUpperCase()} exports.`);
  }
  if (usage.exportRemaining <= 0) {
    throw new Error("Export limit reached for your current plan.");
  }
  return { snapshot, usage };
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.metadata?.userId) return;
  const userId = session.metadata.userId;
  const subscriptionId = session.subscription;
  if (!subscriptionId || typeof subscriptionId !== "string") return;
  await syncSubscriptionFromStripe(userId, subscriptionId);

  await prisma.payment.create({
    data: {
      userId,
      stripePaymentId: session.payment_intent as string,
      
      amount: (session.amount_total ?? 0),
      currency: session.currency ?? "usd",
      status: session.payment_status ?? "paid"
    }
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const _customerId = invoice.customer;
  const stripeSubscriptionId = invoice.subscription;
  if (!stripeSubscriptionId || typeof stripeSubscriptionId !== "string") return;
  const subscription = await prisma.subscription.findFirst({ where: { stripeId: stripeSubscriptionId } });
  if (!subscription) return;

  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      stripePaymentId: invoice.payment_intent as string,
      
      amount: invoice.amount_paid,
      currency: invoice.currency ?? "usd",
      status: invoice.status ?? "paid"
    }
  });
}

export async function handleSubscriptionWebhook(subscriptionId: string, eventType: string) {
  if (!stripe) return;

  const subscription = await prisma.subscription.findFirst({ where: { stripeId: subscriptionId } });
  if (!subscription) return;

  if (eventType === "customer.subscription.deleted") {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELED", priceId: "" } });
  }

  if (eventType === "customer.subscription.updated") {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscriptionFromStripe(subscription.userId, subscriptionId);
    if (stripeSubscription.cancel_at_period_end) {
      const cancelAt = stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null;
      await prisma.subscription.update({ where: { id: subscription.id }, data: { cancelAt } });
    }
  }
}
