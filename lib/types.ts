export type Branch = "physics" | "chemistry" | "math" | "biology";
export type Plan = "free" | "plus" | "pro" | "mentor";

export type Video = {
  id: number;
  title: string;
  youtube_id: string;
  branch: Branch;
  topic: string | null;
  level: string | null;
  plan_required: Plan;
  sort_order: number;
  description: string | null;
  is_published: boolean;
};
