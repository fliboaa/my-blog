import Link from "next/link";
import { type PostMeta } from "@/lib/api";

/**
 * 关联阅读侧栏 —— 展示同标签的其他文章，CTA 引导继续浏览。
 * 纯展示组件，无交互态。详情页右侧第三栏，移动端隐藏。
 */
export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <aside className="related-posts">
      <div className="rp-title">继续阅读</div>
      <div className="rp-list">
        {posts.map((p) => (
          <Link key={p.slug} href={`/posts/${p.slug}`} className="rp-item">
            <span className="rp-item-title">{p.title}</span>
            <span className="rp-item-meta">
              {p.date}
              {p.readingTime ? ` · ${p.readingTime}` : ""}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
