import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-8">
        {children}
      </div>
      <div
        className="relative hidden bg-center bg-cover lg:block"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1519337265831-281ec6cc8514?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/20" />
      </div>
    </div>
  );
}
