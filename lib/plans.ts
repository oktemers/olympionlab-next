export type Plan = "free" | "plus" | "pro" | "mentor";

export const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  mentor: 3
};

export function canAccess(userPlan: Plan | null | undefined, requiredPlan: Plan | null | undefined) {
  const current = userPlan ?? "free";
  const required = requiredPlan ?? "free";
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export function planLabel(plan: Plan) {
  return {
    free: "Free",
    plus: "Plus",
    pro: "Pro",
    mentor: "Mentörlük"
  }[plan];
}
