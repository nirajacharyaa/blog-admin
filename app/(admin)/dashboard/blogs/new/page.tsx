"use client";

import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/blog/blog-form";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { BlogFormData } from "@/schema/blog";

export default function NewBlogPage() {
  const router = useRouter();
  const { createBlog, isCreating } = usePosts();

  const handleSubmit = (data: BlogFormData) => {
    createBlog(data, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
          <p className="text-sm text-muted-foreground">
            Create a new blog post
          </p>
        </div>
      </div>

      <BlogForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
      />
    </div>
  );
}
