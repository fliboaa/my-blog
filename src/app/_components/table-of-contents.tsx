"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: number };

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // 从 prose 内的 h2/h3 提取目录
  useEffect(() => {
    const prose = document.querySelector(".prose");
    if (!prose) return;
    const els = Array.from(prose.querySelectorAll("h2, h3"));
    const items: Heading[] = els
      .map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      }))
      .filter((h) => h.id);
    setHeadings(items);
  }, []);

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

  if (headings.length === 0) return null;

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
    </aside>
  );
}
