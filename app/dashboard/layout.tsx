"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { connectSocket } from "@/lib/socket";
import OwnerSocketListener from "@/components/socket/owner-socket-listener";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    connectSocket();
  }, [pathname, router]);

  return (
    <div suppressHydrationWarning>
      <OwnerSocketListener />
      {children}
    </div>
  );
}