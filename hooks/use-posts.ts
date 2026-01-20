"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Blog, BlogFormData, Tag } from "@/schema/blog";
import { useAuth } from "./use-auth";

interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsePostsParams {
  id?: string;
  page?: number;
  limit?: number;
  search?: string;
  tagId?: string;
}

export function usePosts(params: UsePostsParams = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { id, page = 1, limit = 10, search = "", tagId } = params;

  const blogsQuery = useQuery<BlogsResponse>({
    queryKey: ["blogs", page, limit, search, tagId, user?.id],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(tagId && { tagId }),
      });

      const response = await fetch(`/api/blogs?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      return response.json();
    },
    enabled: !id,
  });

  const blogQuery = useQuery<{ blog: Blog }>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }
      return response.json();
    },
    enabled: !!id,
    retry: false,
  });

  const createBlog = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const response = await fetch(`/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create blog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateBlog = useMutation({
    mutationFn: async ({ id, ...data }: BlogFormData & { id: number }) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update blog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete blog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    blogs: blogsQuery.data?.blogs || [],
    blog: blogQuery.data?.blog,
    pagination: blogsQuery.data?.pagination,
    isLoading: id ? blogQuery.isLoading : blogsQuery.isLoading,
    error: id ? blogQuery.error : blogsQuery.error,
    refetch: id ? blogQuery.refetch : blogsQuery.refetch,
    createBlog: createBlog.mutate,
    updateBlog: updateBlog.mutate,
    deleteBlog: deleteBlog.mutate,
    isCreating: createBlog.isPending,
    isUpdating: updateBlog.isPending,
    isDeleting: deleteBlog.isPending,
  };
}

export function useTags() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ tags: Tag[] }>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch(`/api/tags`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
  });

  const createTag = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tag");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    tags: data?.tags || [],
    isLoading,
    error,
    createTag: createTag.mutate,
    isCreatingTag: createTag.isPending,
  };
}
