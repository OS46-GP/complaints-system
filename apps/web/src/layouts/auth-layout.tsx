import { Outlet } from "react-router";

import { AuthHeader } from "@/components/auth-header";
import { AuthFooter } from "@/components/auth-footer";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthHeader />
      <main className="px-4 flex flex-1 items-center justify-center overflow-hidden py-stack-lg">
        <Outlet />
      </main>
      <AuthFooter />
    </div>
  );
}
