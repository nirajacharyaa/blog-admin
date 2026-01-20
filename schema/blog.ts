import z from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z.string().min(1, "slug is required"),
  content: z.any(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
  tagIds: z.array(z.number()),
});

export type BlogFormData = z.infer<typeof blogSchema>;

export type Tag = {
  id: number;
  name: string;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  content: any;
  featuredImage?: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  userId: number;
  userEmail: string;
  tags: Tag[];
};
