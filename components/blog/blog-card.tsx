"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  ImageIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Blog } from "@/schema/blog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";

interface BlogCardProps {
  blog: Blog;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function BlogCard({ blog, onDelete, isDeleting }: BlogCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="overflow-hidden group py-0 hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {blog.featuredImage ? (
          // biome-ignore lint/performance/noImgElement: dynamic image cannot use next image
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge
            variant={blog.status === "published" ? "default" : "secondary"}
            className={cn(
              "text-xs",
              blog.status === "published" && "bg-green-500 hover:bg-green-600",
              blog.status === "draft" &&
                "bg-yellow-500 hover:bg-yellow-600 text-yellow-950",
            )}
          >
            {blog.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                  <EditIcon className="size-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div>
          <Link
            href={`/dashboard/blogs/${blog.id}/edit`}
            className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors"
          >
            {blog.title}
          </Link>
        </div>

        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{blog.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="size-3" />
          {format(new Date(blog.updatedAt), "MMM d, yyyy")}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(blog.id)}
              disabled={isDeleting}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
