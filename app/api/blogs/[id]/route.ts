import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/db";
import { blog, blogTag, tag, user } from "@/db/schema";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const blogId = parseInt(id, 10);

    if (Number.isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blogPromise = db
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
      .where(and(eq(blog.id, blogId), eq(blog.userId, auth.userId)));

    const tagsPromise = db
      .select({
        tagId: tag.id,
        tagName: tag.name,
      })
      .from(blogTag)
      .innerJoin(tag, eq(blogTag.tagId, tag.id))
      .where(eq(blogTag.blogId, blogId));

    const [blogResults, blogTags] = await Promise.all([
      blogPromise,
      tagsPromise,
    ]);

    const blogResult = blogResults[0];

    return NextResponse.json({
      blog: {
        ...blogResult,
        tags: blogTags.map((bt) => ({ id: bt.tagId, name: bt.tagName })),
      },
    });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized!" }, { status: 401 });
    }

    const { id } = await params;
    const blogId = parseInt(id, 10);

    if (Number.isNaN(blogId)) {
      return NextResponse.json({ error: "invalid blog id" }, { status: 400 });
    }

    const body = await request.json();
    const { title, slug, content, featuredImage, status, tagIds } = body;

    if (slug !== undefined) {
      const slugExists = await db
        .select()
        .from(blog)
        .where(and(eq(blog.slug, slug.trim()), sql`${blog.id} != ${blogId}`))
        .limit(1);

      if (slugExists.length > 0) {
        return NextResponse.json(
          { error: "slug already exists" },
          { status: 400 },
        );
      }
    }

    const updateData: Partial<typeof blog.$inferInsert> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (content !== undefined) updateData.content = content;
    if (featuredImage !== undefined)
      updateData.featuredImage = featuredImage?.trim() || null;

    if (status !== undefined) {
      updateData.status = status;
      if (status === "published") {
        updateData.publishedAt =
          sql`COALESCE(${blog.publishedAt}, NOW())` as any;
      }
    }
    updateData.updatedAt = new Date();

    const [updatedBlogRecord] = await db
      .update(blog)
      .set(updateData)
      .where(and(eq(blog.id, blogId), eq(blog.userId, auth.userId)))
      .returning();

    if (!updatedBlogRecord) {
      return NextResponse.json({ error: "blog not found" }, { status: 404 });
    }

    const tagOperations = [];
    if (tagIds !== undefined && Array.isArray(tagIds)) {
      tagOperations.push(db.delete(blogTag).where(eq(blogTag.blogId, blogId)));

      if (tagIds.length > 0) {
        const tagValues = tagIds.map((tagId: number) => ({
          blogId,
          tagId,
        }));
        tagOperations.push(db.insert(blogTag).values(tagValues));
      }
    }

    await Promise.all(tagOperations);

    const [updatedBlog] = await db
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
      .where(eq(blog.id, blogId));

    const blogTags = await db
      .select({
        tagId: tag.id,
        tagName: tag.name,
      })
      .from(blogTag)
      .innerJoin(tag, eq(blogTag.tagId, tag.id))
      .where(eq(blogTag.blogId, blogId));

    return NextResponse.json({
      blog: {
        ...updatedBlog,
        tags: blogTags.map((bt) => ({ id: bt.tagId, name: bt.tagName })),
      },
    });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized!" }, { status: 401 });
    }

    const { id } = await params;
    const blogId = parseInt(id, 10);

    if (Number.isNaN(blogId)) {
      return NextResponse.json({ error: "invalid blog id" }, { status: 400 });
    }

    const [deletedBlog] = await db
      .delete(blog)
      .where(and(eq(blog.id, blogId), eq(blog.userId, auth.userId)))
      .returning();

    if (!deletedBlog) {
      return NextResponse.json({ error: "blogg not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
