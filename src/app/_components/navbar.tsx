import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";
import { type Post, type Tag } from "@/interfaces/post";
import { TAG_SLUG, TAG_META } from "@/lib/tags";

export function Navbar({ posts }: { posts: Post[] }) {
  // 按标签统计篇数
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    p.tags?.forEach((t: Tag) => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          Aaron<span>&apos;s</span> Blog
        </Link>
        <div className="nav-links">
          <Link href="/articles">文章</Link>
          <SearchBox posts={posts} />
          <div className="nav-item">
            <span className="nav-trigger">
              分类 <span className="caret">▾</span>
            </span>
            <div className="cat-dropdown">
              {(Object.keys(TAG_SLUG) as Tag[]).map((tag) => (
                <Link
                  key={tag}
                  href={`/categories/${TAG_SLUG[tag]}`}
                  className="cat-dropdown-item"
                >
                  <span className="ci">{TAG_META[tag].icon}</span>
                  <span className="cn">{tag}</span>
                  <span className="ccount">{counts[tag] || 0} 篇</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/#about">关于</Link>
          <ThemeToggle />
          <Link href="/#rss" className="btn-primary">
            订阅 RSS
          </Link>
        </div>
      </div>
    </nav>
  );
}
