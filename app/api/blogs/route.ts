import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/db";
import { blog, blogTag, tag, user } from "@/db/schema";
import { verifyAuth } from "@/lib/auth";
import { blogSchema } from "@/schema/blog";
import z from "zod";

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized!" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const tagId = searchParams.get("tagId");

    const offset = (page - 1) * limit;

    const conditions = [eq(blog.userId, auth.userId)];

    if (search) {
      conditions.push(ilike(blog.title, `%${search}%`));
    }

    if (tagId) {
      const tagIdNum = parseInt(tagId, 10);
      if (!Number.isNaN(tagIdNum)) {
        const subquery = db
          .select({ blogId: blogTag.blogId })
          .from(blogTag)
          .where(eq(blogTag.tagId, tagIdNum));
        conditions.push(sql`${blog.id} IN ${subquery}`);
      }
    }

    const blogsResult = await db
      .select({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        featuredImage: blog.featuredImage,
        status: blog.status,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        userId: blog.userId,
        userEmail: user.email,
        totalCount: sql<number>`count(*) OVER()`.mapWith(Number),
      })
      .from(blog)
      .innerJoin(user, eq(blog.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(blog.createdAt))
      .limit(limit)
      .offset(offset);

    const blogs = blogsResult;
    const total = blogs.length > 0 ? blogs[0].totalCount : 0;

    const blogIds = blogs.map((b) => b.id);
    const blogTags =
      blogIds.length > 0
        ? await db
            .select({
              blogId: blogTag.blogId,
              tagId: tag.id,
              tagName: tag.name,
            })
            .from(blogTag)
            .innerJoin(tag, eq(blogTag.tagId, tag.id))
            .where(sql`${blogTag.blogId} IN ${blogIds}`)
        : [];

    const blogsWithTags = blogs.map((blog) => ({
      ...blog,
      tags: blogTags
        .filter((bt) => bt.blogId === blog.id)
        .map((bt) => ({ id: bt.tagId, name: bt.tagName })),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      blogs: blogsWithTags,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch {
    return NextResponse.json({ error: "server error@!!" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized!" }, { status: 401 });
    }

    const body = await request.json();
    const result = blogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: z.treeifyError(result.error) },
        { status: 400 },
      );
    }

    const { content, slug, status, featuredImage, tagIds, title } = result.data;
    const existingSlug = await db
      .select()
      .from(blog)
      .where(eq(blog.slug, slug.trim()))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "slug already exists" },
        { status: 400 },
      );
    }

    const [newBlog] = await db
      .insert(blog)
      .values({
        userId: auth.userId,
        title: title.trim(),
        slug: slug.trim(),
        content,
        featuredImage: featuredImage?.trim() || null,
        status: status || "draft",
        publishedAt: status === "published" ? new Date() : null,
      })
      .returning();

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const tagValues = tagIds.map((tagId: number) => ({
        blogId: newBlog.id,
        tagId,
      }));

      await db.insert(blogTag).values(tagValues);
    }

    const [createdBlog] = await db
      .select({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        featuredImage: blog.featuredImage,
        status: blog.status,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        userId: blog.userId,
        userEmail: user.email,
      })
      .from(blog)
      .innerJoin(user, eq(blog.userId, user.id))
      .where(eq(blog.id, newBlog.id));

    const blogTagsResult =
      tagIds && tagIds.length > 0
        ? await db
            .select({
              tagId: tag.id,
              tagName: tag.name,
            })
            .from(blogTag)
            .innerJoin(tag, eq(blogTag.tagId, tag.id))
            .where(eq(blogTag.blogId, newBlog.id))
        : [];

    return NextResponse.json(
      {
        blog: {
          ...createdBlog,
          tags: blogTagsResult.map((bt) => ({
            id: bt.tagId,
            name: bt.tagName,
          })),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
