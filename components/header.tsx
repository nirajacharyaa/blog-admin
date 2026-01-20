"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboardIcon } from "lucide-react";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold hidden sm:inline">Blog</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {!isAuthenticated ? (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Login
            </Link>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-37.5">
                  {user?.email}
                </span>
              </div>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "sm" })}
              >
                <LayoutDashboardIcon className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
