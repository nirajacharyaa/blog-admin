"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, ImageIcon, SaveIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTags } from "@/hooks/use-posts";
import {
  type Blog,
  type BlogFormData,
  blogSchema,
  type Tag,
} from "@/schema/blog";
import { TagSelector } from "./tag-selector";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

interface BlogFormProps {
  blog?: Blog | null;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogForm({
  blog,
  onSubmit,
  onCancel,
  isLoading,
}: BlogFormProps) {
  const { tags, createTag, isCreatingTag } = useTags();
  const [selectedTags, setSelectedTags] = useState<Tag[]>(blog?.tags || []);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || "",
      slug: blog?.slug || "",
      content: blog?.content || {},
      featuredImage: blog?.featuredImage || "",
      status: (blog?.status as "draft" | "published") || "draft",
      tagIds: blog?.tags?.map((t) => t.id) || [],
    },
  });

  useEffect(() => {
    form.setValue(
      "tagIds",
      selectedTags.map((t) => t.id),
    );
  }, [selectedTags, form]);

  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        featuredImage: blog.featuredImage || "",
        status: blog.status,
        tagIds: blog.tags.map((t) => t.id),
      });
      setSelectedTags(blog.tags);
    }
  }, [blog, form]);

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = (name: string) => {
    createTag(name, {
      onSuccess: (response) => {
        const newTag = response.tag;
        setSelectedTags([...selectedTags, newTag]);
      },
    });
  };

  const availableTags = tags.filter(
    (tag) => !selectedTags.find((st) => st.id === tag.id),
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-w-0">
      <div className="grid gap-6 lg:grid-cols-3 min-w-0 pb-24 lg:pb-12">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter blog title"
              className="text-lg"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="blog-post-url"
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog content..."
                />
              )}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {String(form.formState.errors.content.message)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileTextIcon className="size-4" />
              Publish Settings
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-yellow-500" />
                          Draft
                        </span>
                      </SelectItem>
                      <SelectItem value="published">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-green-500" />
                          Published
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="size-4" />
              Featured Image
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("featuredImage")}
                placeholder="Enter image URL"
              />
              {form.watch("featuredImage") && (
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  {/** biome-ignore lint/performance/noImgElement: dynamic image cannot use next image */}
                  <img
                    src={form.watch("featuredImage") || ""}
                    alt="Featured"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
              {form.formState.errors.featuredImage && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.featuredImage.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <Label>Tags</Label>
            <TagSelector
              selectedTags={selectedTags}
              availableTags={availableTags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onCreateTag={handleCreateTag}
              isCreating={isCreatingTag}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 bg-background/95 inset-x-0 w-full backdrop-blur supports-backdrop-filter:bg-background/60 p-4 border-t sm:border-0 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="gap-2"
        >
          <SaveIcon className="size-4" />
          {isLoading ? "Saving..." : blog ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
