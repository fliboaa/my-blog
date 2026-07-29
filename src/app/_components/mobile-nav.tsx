"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Tag } from "@/interfaces/post";
import { TAG_SLUG, TAG_META } from "@/lib/tags";
import { SearchBox } from "./search-box";

type Props = {
  tagCounts: Record<string, number>;
};

export function MobileNav({ tagCounts }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // 路由变化时关闭抽屉
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 打开时锁住背景滚动
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // portal 必须在客户端渲染后才能访问 document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        className="hamburger"
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`ham-line ${open ? "open" : ""}`} />
        <span className={`ham-line ${open ? "open" : ""}`} />
        <span className={`ham-line ${open ? "open" : ""}`} />
      </button>
      {mounted && (
        <>
          {createPortal(
            <div
              className={`mobile-overlay ${open ? "open" : ""}`}
              onClick={() => setOpen(false)}
            />,
            document.body,
          )}
          {createPortal(
            <div className={`mobile-drawer ${open ? "open" : ""}`}>
              <div className="mobile-search-wrap">
                <SearchBox />
              </div>
              <nav className="mobile-links">
                <Link href="/articles">文章</Link>
                <div className="mobile-cat-label">分类</div>
                <div className="mobile-cats">
                  {(Object.keys(TAG_SLUG) as Tag[]).map((tag) => (
                    <Link
                      key={tag}
                      href={`/categories/${TAG_SLUG[tag]}`}
                      className="mobile-cat-item"
                    >
                      <span className="ci">{TAG_META[tag].icon}</span>
                      <span className="cn">{tag}</span>
                      <span className="ccount">{tagCounts[tag] || 0} 篇</span>
                    </Link>
                  ))}
                </div>
                <Link href="/#about">关于</Link>
                <Link href="/#rss" className="btn-primary mobile-rss">
                  订阅 RSS
                </Link>
              </nav>
            </div>,
            document.body,
          )}
        </>
      )}
    </>
  );
}
