"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, UserIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { type AuthFormValues, authSchema } from "@/schema/auth";

export function SignUpForm() {
  const { signup, isLoading } = useAuth();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSignUp = async (data: AuthFormValues) => {
    try {
      await signup(data);
    } catch {}
  };

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        await handleSignUp(data);
      })}
    >
      <FieldGroup className="flex flex-col gap-6 pb-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="relative flex w-full flex-1 items-center border">
                <Input
                  type="email"
                  placeholder="m@example.com"
                  className="pr-10"
                  {...field}
                />
                <UserIcon className="absolute right-3 size-4 text-muted-foreground/80" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="relative flex w-full flex-1 items-center border">
                <Input
                  type="password"
                  placeholder="Password"
                  className="pr-10"
                  {...field}
                />
                <LockIcon className="absolute right-3 size-4 text-muted-foreground/80" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting || isLoading}
          type="submit"
          className="px-4 py-2"
        >
          Sign up
        </Button>
      </FieldGroup>
    </form>
  );
}
