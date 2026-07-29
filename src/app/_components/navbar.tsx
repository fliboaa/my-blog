import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";
import { MobileNav } from "./mobile-nav";
import { type Tag } from "@/interfaces/post";
import { TAG_SLUG, TAG_META } from "@/lib/tags";

type Props = {
  tagCounts: Record<string, number>;
};

export function Navbar({ tagCounts }: Props) {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          Aaron<span>&apos;s</span> Blog
        </Link>
        {/* 桌面导航：窄屏隐藏 */}
        <div className="nav-links">
          <Link href="/articles">文章</Link>
          <SearchBox />
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
                  <span className="ccount">{tagCounts[tag] || 0} 篇</span>
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
        {/* 移动端：主题切换 + 汉堡菜单，桌面隐藏 */}
        <div className="nav-mobile-controls">
          <ThemeToggle />
          <MobileNav tagCounts={tagCounts} />
        </div>
      </div>
    </nav>
  );
}
