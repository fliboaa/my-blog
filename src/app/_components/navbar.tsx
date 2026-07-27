import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          Aaron<span>&apos;s</span> Blog
        </Link>
        <div className="nav-links">
          <Link href="/#articles">文章</Link>
          <Link href="/#categories">分类</Link>
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
