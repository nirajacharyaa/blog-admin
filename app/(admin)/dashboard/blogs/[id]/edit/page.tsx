"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BlogForm } from "@/components/blog/blog-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/use-posts";
import type { BlogFormData } from "@/schema/blog";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { blog, isLoading, updateBlog, isUpdating, error } = usePosts({ id });

  useEffect(() => {
    if (error) {
      router.push("/dashboard");
    }
  }, [error, router]);

  const handleSubmit = (data: BlogFormData) => {
    if (blog) {
      updateBlog(
        { id: blog.id, ...data },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
        },
      );
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-sm text-muted-foreground">
            {blog?.title || "Loading..."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : blog ? (
        <BlogForm
          blog={blog}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Blog not found
        </div>
      )}
    </div>
  );
}
