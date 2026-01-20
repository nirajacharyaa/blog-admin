import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto w-87.5 space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-bold text-2xl">Sign in to your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email below to sign in
        </p>
      </div>
      <LoginForm />
      <div>
        <p className="px-2 text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="underline hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
