import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Signing in is not enough: the identity must also be listed in the
 * ADMIN_EMAILS environment variable of the Convex deployment.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("غير مسجّل الدخول");
  }

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) {
    throw new Error(
      "ADMIN_EMAILS غير مضبوط على نشر Convex، فلا يمكن التحقق من صلاحية الإدارة",
    );
  }

  const email = identity.email?.toLowerCase();
  if (!email || !allowed.includes(email)) {
    throw new Error("هذا الحساب غير مصرّح له بالإدارة");
  }

  return identity;
}
