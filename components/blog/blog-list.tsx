"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Blog } from "@/schema/blog";
import { BlogCard } from "./blog-card";

interface BlogListProps {
  blogs: Blog[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function BlogList({
  blogs,
  isLoading,
  onDelete,
  isDeleting,
}: BlogListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden py-0">
            <Skeleton className="aspect-video" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="font-medium mb-1">No posts yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first blog post to get started!
        </p>
        <Link href="/dashboard/blogs/new">
          <Button size="sm">Create Post</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
