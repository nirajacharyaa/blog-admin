"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BlogList } from "@/components/blog/blog-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/use-debounce";
import { usePosts, useTags } from "@/hooks/use-posts";

const Page = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const { blogs, pagination, isLoading, deleteBlog, isDeleting } = usePosts({
    page,
    search: debouncedSearch,
    tagId: selectedTagId,
  });

  const { tags } = useTags();

  const handleDelete = (id: number) => {
    deleteBlog(id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog posts
          </p>
        </div>
        <Link href="/dashboard/blogs/new">
          <Button className="w-full sm:w-auto">
            <PlusIcon className="size-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={selectedTagId}
          onValueChange={(value) => {
            setSelectedTagId(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-42">
            <FilterIcon className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent className="mt-10">
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id.toString()}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BlogList
        blogs={blogs}
        isLoading={isLoading}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {pagination && blogs.length !== 0 && (
        <div className="flex items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="size-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
