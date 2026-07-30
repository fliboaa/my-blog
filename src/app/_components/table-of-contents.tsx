"use client";

import { useEffect, useState } from "react";
import { type Heading } from "@/lib/toc";

type Props = {
  headings: Heading[];
};

/**
 * 文章目录 —— 标题列表由服务端构建时提取（extractHeadings）传入，
 * SSG HTML 里直接包含完整目录，不依赖 client JS 读 DOM。
 * 仅保留 scroll-spy 高亮 + 点击跳转作为客户端交互。
 */
export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  // scroll-spy：高亮当前可视标题
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <aside className="toc">
      {headings.length > 0 && (
        <>
          <div className="toc-title">本页目录</div>
          <ul>
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "toc-sub" : ""}>
                <a
                  href={`#${h.id}`}
                  className={activeId === h.id ? "active" : ""}
                  onClick={(e) => handleClick(e, h.id)}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
