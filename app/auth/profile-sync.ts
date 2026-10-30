import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase's user-created trigger builds the profile before email confirmation.
// Save the student's selected branch on their FIRST verified session only.
// Never overwrite a branch changed later in profile settings.
export async function syncSignupBranch(supabase: SupabaseClient) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return;
  const branch = user.user_metadata?.branch;
  if (!["physics","chemistry","math","biology"].includes(branch)) return;
  const { error } = await supabase.from("profiles")
    .update({ branch }).eq("id",user.id).is("branch",null);
  if (error) console.error("Profile branch sync failed",error.message);
}
