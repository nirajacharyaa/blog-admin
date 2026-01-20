CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "featured_image" varchar(512);--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "status" "blog_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "published_at" timestamp with time zone;