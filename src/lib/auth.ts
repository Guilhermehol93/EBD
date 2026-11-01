import type { User } from "@supabase/supabase-js";

export function isAdminUser(user: User | null | undefined): user is User {
  return user?.app_metadata?.role === "admin";
}
