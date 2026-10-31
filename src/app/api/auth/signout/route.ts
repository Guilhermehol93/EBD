import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 302,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
