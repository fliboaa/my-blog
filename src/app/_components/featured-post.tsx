import Link from "next/link";
import { type PostMeta } from "@/lib/api";
import { TagBadge } from "./tag-badge";
import DateFormatter from "./date-formatter";

export function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="featured">
      <div className="featured-body">
        {post.tags?.map((t) => (
          <TagBadge key={t} tag={t} />
        ))}
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="featured-meta">
          <DateFormatter dateString={post.date} />
          {post.readingTime && (
            <>
              <span className="dot" />
              <span>{post.readingTime} 阅读</span>
            </>
          )}
        </div>
      </div>
      <div className="featured-img">🔁</div>
    </Link>
  );
}
