import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { isAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, this is the login page - render clean full screen
  if (!isAdminUser(user)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-taupe-50 font-sans dark:bg-taupe-950 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userEmail={user.email} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
