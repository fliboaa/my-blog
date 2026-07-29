import Link from "next/link";
import { type PostMeta } from "@/lib/api";
import { TagBadge } from "./tag-badge";
import DateFormatter from "./date-formatter";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="card">
      <div className="card-tags">
        {post.tags?.map((t) => (
          <TagBadge key={t} tag={t} />
        ))}
      </div>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <div className="card-meta">
        <DateFormatter dateString={post.date} />
        {post.readingTime && (
          <>
            <span className="dot" />
            <span>{post.readingTime}</span>
          </>
        )}
      </div>
    </Link>
  );
}
