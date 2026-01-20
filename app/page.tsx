import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Our Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Discover a new way to create, share, and manage your content with
            ease.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
