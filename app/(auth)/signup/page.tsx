import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto w-87.5 space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-bold text-2xl">Sign up for an account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email below to sign up
        </p>
      </div>
      <SignUpForm />
      <div>
        <p className="px-2 text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
