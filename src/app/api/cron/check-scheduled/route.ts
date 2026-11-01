import { NextRequest, NextResponse } from "next/server";
import { processScheduledMagazines } from "@/lib/scheduler";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check authorization: CRON_SECRET or authenticated admin user
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let isAuthorized = false;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  } else {
    // Check if called by logged in admin user
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (isAdminUser(user)) {
        isAuthorized = true;
      }
    } catch {
      // ignore
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await processScheduledMagazines();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
